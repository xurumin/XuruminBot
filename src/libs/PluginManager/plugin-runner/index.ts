import { Command } from "../@types/Command";
import { Plugin } from "../@types/Plugin";
import { Request } from "../@types/Request";
import { Response } from "../@types/Response";

export class PluginRunner {
  private _commands: Record<string, Command> = {};

  public loadCommandsFrom(plugins: Plugin[]) {
    plugins.forEach((plugin) => {
      plugin.commands.forEach((command) => {
        this._commands[command.name] = command;
      });
    });
  }

  public get commands() {
    return new Map(Object.entries(this._commands));
  }

  public set commands(commands: Map<string, Command>) {
    this._commands = Object.fromEntries(commands);
  }

  public doesCommandExist(command: string) {
    return !!this._commands[command];
  }

  public async run(command: string, request: Request, response: Response) {
    const cmd = this._commands[command];

    if (!cmd) {
      throw new Error(`Command ${command} does not exist!`);
    }

    return await cmd.execute(request, response);
  }
}
