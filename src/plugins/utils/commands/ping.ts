import { Command } from '../../../libs/PluginManager/@types/Command'
import { Context } from '../../../libs/PluginManager/@types/Context';

export default class PingCommand implements Command {
  name: string = "ping";
  description: string = "Pong! Ou pong...?";
  async execute(context: Context) {
    const start = Date.now();
    await context.interaction?.createMessage("Ping...?");
    await context.interaction?.editOriginalMessage(`Pong in ${Date.now() - start}ms`);
  }
}