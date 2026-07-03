import { SlashCommandBuilder } from "discord.js";
import type { Command } from "../types/command";

export const ping: Command = {
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("測試機器人是否正常運作"),

    async execute(interaction) {
        await interaction.reply("Pong 🏓");
    }
};