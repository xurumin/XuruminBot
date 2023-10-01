import PluginLoader from "./plugin-loader";
import { info } from "./lib/Logger";
import { PluginRunner } from "./plugin-runner";
import { Plugin } from "./@types/Plugin";

export class PluginManager {
  private _plugins: Plugin[] = [];
  private _loader: PluginLoader;
  private _runner: PluginRunner;

  constructor(pluginSrcPath: string) {
    this._loader = new PluginLoader(pluginSrcPath);
    this._runner = new PluginRunner();
  }

  get loader() {
    return this._loader;
  }

  get runner() {
    return this._runner;
  }

  public async init() {
    info("Loading plugins...");

    let start = performance.now();
    this._plugins = await this._loader.loadPlugins();
    let end = performance.now();

    info(
      `${this._plugins.length} plugins loaded! (${(end - start).toFixed(
        2,
      )}ms)`,
    );

    info("Loading commands...");
    start = performance.now();
    this._runner.loadCommandsFrom(this._plugins);
    end = performance.now();

    info(
      `${this._runner.commands.size} commands loaded! (${(end - start).toFixed(
        2,
      )}ms)`,
    );
  }
}
