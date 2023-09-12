import { Command } from "../../libs/PluginManager/@types/Command";
import { Plugin } from "../../libs/PluginManager/@types/Plugin";
import { commandLoader } from "../../libs/cmd-loader.ts";

class UtilsPlugin extends Plugin {
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
    const cmds = await commandLoader(import.meta.dir + "/commands")
    this.commands.push(...cmds)
  }
  async reload() {
  }
}
export default UtilsPlugin;