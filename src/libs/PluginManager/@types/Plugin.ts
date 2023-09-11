import { Command } from "./Command";

export abstract class Plugin {
  abstract name: string;
  abstract description: string;
  abstract commands: Command[];

  /**
   * Load the plugin.
   * @description
   * This method is called when the plugin is loaded.
   **/
  abstract load(): Promise<void>;

  /**
   * Reload the plugin.
   * @description
   * This method is called when the plugin is reloaded.
   **/
  abstract reload(): Promise<void>;
}
