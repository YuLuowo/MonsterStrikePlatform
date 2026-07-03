import "dotenv/config";

export const env = {
    token: process.env.DISCORD_TOKEN!,
    clientId: process.env.CLIENT_ID!,
    guildId: process.env.GUILD_ID!,
};