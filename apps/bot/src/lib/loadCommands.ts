import { Command } from "../types/command";
import { ping } from "../commands/ping";

export const commands: Record<string, Command> = {
    ping,
};