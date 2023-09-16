import { Command } from '../../../libs/PluginManager/@types/Command'
import { Request } from '../../../libs/PluginManager/@types/Request';
import { Response } from '../../../libs/PluginManager/@types/Response';

export default class PingCommand implements Command {
  name: string = "ping";
  description: string = "Pong! Ou pong...?";
  async execute(request: Request, _: Response) {
    const start = Date.now();
    await request.interaction?.createMessage("Ping...?");
    await request.interaction?.editOriginalMessage(`Pong in ${Date.now() - start}ms`);
  }
}