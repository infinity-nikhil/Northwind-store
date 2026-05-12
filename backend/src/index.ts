import "dotenv/config";
import express from "express";
import cors from "cors";

import * as Sentry from "@sentry/node";

import { clerkMiddleware } from '@clerk/express'
import { clerkWebhookHandler } from "./webhooks/clerk"
import { getEnv } from "./lib/env";

import productRouter from "./routes/productRouter";
import meRouter from "./routes/meRouter";
import streamRouter from "./routes/streamRouter";
import checkoutRouters from "./routes/checkoutRouter";
import adminRouter from "./routes/adminRouter";
import orderRouter from "./routes/orderRouter";

import { polarWebhookHandler } from "./webhooks/polar";
import { sentryClerkUserMiddleware } from "./middleware/sentryClerkUser";

const env = getEnv();
const app = express();

const rawJson = express.raw({ type: "application/json", limit: "1mb" });

// it's important that you don't parse the webhook event data, it should be in the raw format

app.post("webhooks/clerk", rawJson, (req,res) => {
    void clerkWebhookHandler(req,res);
})

app.post("/webhooks/polar", rawJson, (req, res) => {
    void polarWebhookHandler(req, res);
});

app.use(express.json())
app.use(cors())
app.use(clerkMiddleware())
app.use(sentryClerkUserMiddleware);

app.use("/api/me", meRouter);
app.use("/api/products", productRouter);
app.use("/api/stream", streamRouter);
app.use("/api/checkout", checkoutRouters);
app.use("/api/admin", adminRouter);
app.use("/api/orders", orderRouter);

// sentry will be attached to the response object
Sentry.setupExpressErrorHandler(app);

app.use(
(_err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
const sentryId = (res as express.Response & { sentry?: string }).sentry;

res.status(500).json({
    error: "Internal server error",
    ...(sentryId !== undefined && { sentryId }),
});
},
);

app.listen(env.PORT, () => console.log("Server started at port", env.PORT));