import { Interaction } from "discord.js";
import { commands } from "./loadCommands";

export async function handleInteraction(interaction: Interaction) {
    if (!interaction.isChatInputCommand()) return;

    const command = commands[interaction.commandName];

    if (!command) {
        await interaction.reply({
            content: "指令不存在",
            ephemeral: true,
        });
        return;
    }

    await command.execute(interaction);
}