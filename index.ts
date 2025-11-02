import { getFullnodeUrl, SuiClient } from "@mysten/sui/client";
import { webhookCallback } from "grammy";
import { bot } from "./tg-bot";
import { pollForBuyEvents } from "./polling/poller";
const PORT = process.env.PORT || 4444;

export const suiClient = new SuiClient({
    url: "https://sui-mainnet-endpoint.blockvision.org",
});

// Only run the server and polling when this file is executed directly
if (import.meta.main) {
    Bun.serve({
        fetch: (req) => {
            if (req.method === "POST") {
                return webhookCallback(bot, "std/http")(req)
            }
            return new Response("Hello, this is a Telegram bot!");
        },
        port: PORT
    });

    pollForBuyEvents();
    console.log(`🛫 Server is running on port ${PORT}....`);
}