import { Command } from '../../../libs/PluginManager/@types/Command'
import { Request } from '../../../libs/PluginManager/@types/Request';
import { Response } from '../../../libs/PluginManager/@types/Response';

export class PingCommand implements Command {
  name: string = "ping";
  description: string = "Pong!";
  async execute(request: Request, response: Response) {    
    const m = await response.send("Pinging...");
    m.edit(`Pong in ${m.createdAt - request.createdAt}ms!`)
  }
}