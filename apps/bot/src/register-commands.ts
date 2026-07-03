import { REST, Routes } from "discord.js";
import { env } from "./config/env";
import { ping } from "./commands/ping";

const commands = [ping.data.toJSON()];

const rest = new REST({ version: "10" }).setToken(env.token);

async function main() {
    try {
        console.log("Registering commands...");

        await rest.put(
            Routes.applicationGuildCommands(
                env.clientId,
                env.guildId
            ),
            { body: commands }
        );

        console.log("Commands registered!");
    } catch (err) {
        console.error(err);
    }
}

main();