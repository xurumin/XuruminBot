import { Command } from '../../../libs/PluginManager/@types/Command'
import { Request } from '../../../libs/PluginManager/@types/Request';
import { Response } from '../../../libs/PluginManager/@types/Response';

export default class PingCommand implements Command {
  name: string = "ping";
  description: string = "Pong! Ou pong...?";
  async execute(request: Request, response: Response) {    
   await response.send(`Pong in ${Date.now() - request.createdAt}ms`);
  }
}