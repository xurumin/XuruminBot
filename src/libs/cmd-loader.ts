import { readdir } from "fs/promises";

export async function commandLoader(path: string) {
  const files = await readdir(path);
  const commands = [];

  for(let file of files) {
    const filePath = path + "/" + file;
    const PluginClass = await import(filePath);

    const instance = new PluginClass.default();
    commands.push(instance);
  }

  return commands;
}