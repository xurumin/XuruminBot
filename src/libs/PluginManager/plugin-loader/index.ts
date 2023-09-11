import { Plugin } from "../@types/Plugin";
import { readdirSync } from "fs";
import { info } from "../lib/Logger";

export default class Loader {
  constructor(private path: string) { }

  public async loadPlugins() {
    info("Loading plugins...");
    const plugins: Plugin[] = [];

    const paths = this.loadPath(this.path);

    for await (const pluginPath of paths) {
      const PluginClass = (await import(pluginPath)).default;

      const instance = new PluginClass() as Plugin;

      info(`- Loading plugin "${instance.name}"...`);

      if (!(instance instanceof Plugin)) {
        throw new Error("Plugin must be an instance of Plugin");
      }

      await instance.load();
      plugins.push(instance);
    }

    return plugins;
  }

  private loadPath(path: string) {
    const paths = [];
    const files = readdirSync(path);

    for (const file of files) {
      const filePath = path + "/" + file;
      paths.push(filePath);
    }

    return paths;
  }
}
