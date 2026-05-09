import { StreamChat } from "stream-chat";
import type { UserRole } from "../db/schema.js";
import "dotenv/config"
import { Env } from "./env.js";

//The below function takes 3 params and is responsible for what name will be shown in stream
export function streamChatDisplayName(
    role: UserRole,
    displayName: string | null,
    email: string,
): string {
    const base = displayName ?? email.split("@")[0];
    if (role === "admin") return `Admin · ${base}`;
    if (role === "support") return `Support · ${base}`;
    return base;
}

//You can all it the connection type i guess
export function getStreamChatServer(env: Env) {
    return StreamChat.getInstance(env.STREAM_API_KEY, env.STREAM_API_SECRET);
}

//just a helper function 
export function streamUserId(clerkUserId: string) {
  return `clerk_${clerkUserId}`;
}