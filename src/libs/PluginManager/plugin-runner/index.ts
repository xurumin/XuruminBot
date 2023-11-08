import type Eris from "eris";
import { Command } from "../@types/Command";
import { Context } from "../@types/Context";
import { Plugin } from "../@types/Plugin";

export class PluginRunner {
  private _commands: Map<string, Command> = new Map();

  public loadCommandsFrom(plugins: Plugin[]) {
    plugins.forEach((plugin) => {
      plugin.commands.forEach((command) => {
        this._commands.set(command.name, command);
      });
    });
  }

  public get commands() {
    return this._commands;
  }

  public set commands(commands: Map<string, Command>) {
    this._commands = commands;
  }

  public doesCommandExist(command: string) {
    return this._commands.has(command);
  }

  public async run(command: string, context: Context) {
    const cmd = this._commands.get(command);

    if (!cmd) {
      throw new Error(`Command ${command} does not exist!`);
    }

    return await cmd.execute(context);
  }

  public async runInteraction(interaction: Eris.ComponentInteraction) {
    const cmd = this._commands.get(interaction.message.interaction?.name || "");

    if (!cmd) {
      throw new Error(`Command ${interaction.message.interaction?.name} does not exist!`);
    }

    return await cmd.handleInteraction?.(interaction);
  }
}
