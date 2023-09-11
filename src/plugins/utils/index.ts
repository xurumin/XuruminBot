import { Command } from "../../libs/PluginManager/@types/Command";
import { Plugin } from "../../libs/PluginManager/@types/Plugin";

class UtilsPlugin extends Plugin{
  private _name = "Utils";
  private _description = "A plugin with some useful commands.";
  private _commands: Command[] = []

  get name() {
    return this._name;
  }

  get description() {
    return this._description;
  }

  get commands() {
    return this._commands;
  }

  async load() {
    const ping = await import("./commands/ping.ts");    
    this.commands.push(new ping.PingCommand());
  }
  async reload() {
  }
}
export default UtilsPlugin;