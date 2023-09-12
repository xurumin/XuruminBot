import { Command } from '../../../libs/PluginManager/@types/Command'
import { Request } from '../../../libs/PluginManager/@types/Request';
import { Response } from '../../../libs/PluginManager/@types/Response';

export default class Uptime implements Command {
  name: string = "uptime";
  description: string = "Veja quanto tempo eu estou online!";

  async execute(_: Request, response: Response) {
    const uptime = process.uptime();

    let text = "";

    const days = Math.floor(uptime / 86400);
    const hours = Math.floor(uptime / 3600) % 24;
    const minutes = Math.floor(uptime / 60) % 60;
    const seconds = Math.floor(uptime % 60);

    if(days > 0) text += `${days} dias, `;
    if(hours > 0) text += `${hours} horas, `;
    if(minutes > 0) text += `${minutes} minutos e `;
    text += `${seconds} segundos`;

    await response.send(`Estou online há ${text} :D`);
  }
}