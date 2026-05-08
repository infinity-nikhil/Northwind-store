import "dotenv/config";
import express from "express";
import cors from "cors";

import { clerkMiddleware } from '@clerk/express'
import { clerkWebhookHandler } from "./webhooks/clerk"
import { getEnv } from "./lib/env";

import productRouter from "./routes/productRouter";
import meRouter from "./routes/meRouter";
import streamRouter from "./routes/streamRouter";

const env = getEnv();
const app = express();

const rawJson = express.raw({ type: "application/json", limit: "1mb" });

// it's important that you don't parse the webhook event data, it should be in the raw format

app.post("webhooks/clerk", rawJson, (req,res) => {
    void clerkWebhookHandler(req,res);
})

app.use(express.json())
app.use(cors())
app.use(clerkMiddleware())

app.use("/api/me", meRouter);
app.use("/api/products", productRouter);
app.use("/api/stream", streamRouter);

app.listen(env.PORT, () => console.log("Server started at port", env.PORT));