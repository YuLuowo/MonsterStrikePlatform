import { client } from "./lib/client";
import { env } from "./config/env";
import { handleInteraction } from "./lib/interactionHandler";

client.once("ready", () => {
    console.log(`Logged in as ${client.user?.tag}`);
});

client.on("interactionCreate", handleInteraction);

client.login(env.token);