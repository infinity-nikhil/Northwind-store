import type { Request, Response, NextFunction } from "express";
import { getAuth, clerkClient } from "@clerk/express";
import { getLocalUser } from "../lib/users.js";
import {
  getStreamChatServer,
  streamChatDisplayName,
  streamUserId,
} from "../lib/stream.js";
import { getEnv } from "../lib/env.js";

const env = getEnv();

export async function createStreamToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { userId, isAuthenticated } = getAuth(req);
    if (!isAuthenticated || !userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const localUser = await getLocalUser(userId);
    if (!localUser) {
      res.status(503).json({ error: "Account not synced yet" });
      return;
    }

    // 1. Get the server singleton (authenticated with your secret key)
    const server = getStreamChatServer(env);

    const clerkUser = await clerkClient.users.getUser(userId);

    const combined =
      [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") ||
      null;

      // 2. Build the display name based on role
    const name = streamChatDisplayName(
      localUser.role,
      localUser.displayName ?? combined ?? clerkUser.username,
      localUser.email
    );

    const image = clerkUser.imageUrl || undefined;

    // 3. Namespace the user ID
    const sid = streamUserId(userId);

    // 4. Register/update this user on Stream's side
    await server.upsertUser({ id: sid, name, image });

    // 5. Generate a token for the frontend to connect directly to Stream
    const token = server.createToken(sid);

    // 6. Send everything the frontend needs
    res.json({ token, apiKey: env.STREAM_API_KEY, userId: sid });
  } catch (e) {
    next(e);
  }
}
