import { describe, expect, it } from "vitest";
import PluginLoader from ".";
import path from "path";

describe("PluginLoader", () => {
  const mockPath = path.resolve(
    __dirname,
    "../../../__tests__/__mocks__/plugins",
  );
  const pluginLoader = new PluginLoader(mockPath);

  it("should load plugins", async () => {
    expect(pluginLoader.plugins.length).toBe(0);
    await pluginLoader.loadPlugins();
    expect(pluginLoader.plugins.length).toBe(1);
  });

  it("should reload plugins", async () => {
    await pluginLoader.reload();
    expect(pluginLoader.plugins.length).toBe(1);
  });
});
