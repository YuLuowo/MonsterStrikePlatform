import { REST, Routes } from "discord.js";
import { env } from "./config/env";

const rest = new REST().setToken(env.token);

rest.put(Routes.applicationCommands(env.clientId), { body: [] })
    .then(() => console.log('Successfully deleted all global application commands.'))
    .catch(console.error);

rest.put(Routes.applicationGuildCommands(env.clientId, env.guildId), { body: [] })
    .then(() => console.log('Successfully deleted all guild commands.'))
    .catch(console.error);
