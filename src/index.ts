import Eris from "eris";
import { PluginManager } from "./libs/PluginManager";
import { Request } from "./libs/PluginManager/@types/Request";
import { Response } from "./libs/PluginManager/@types/Response";

const TOKEN = process.env.DISCORD_TOKEN as string;
const PREFIX = process.env.COMMAND_PREFIX as string;

const bot = Eris(TOKEN, {
  intents: [
    "guildMessages"
  ]
})

const pm = new PluginManager(import.meta.dir + "/plugins")
await pm.init()


bot.on("messageCreate", (msg) => {
  if (
    (!msg.content.toLocaleLowerCase().startsWith(PREFIX))
    && !(msg.content.startsWith(`<@!${bot.user.id}>`)
    || msg.content.startsWith(`<@${bot.user.id}>`))) return;

  const content = msg.content.split(" ");
  const command = content[0].replace(PREFIX, "");

  const request: Request = {
    content: msg.content,
    createdAt: msg.createdAt,
    sender: {
      avatar: msg.author.avatar || "",
      id: msg.author.id,
      isBot: msg.author.bot,
      name: msg.author.username,
    }
  }

  const response : Response = {
    send: async (content) => {
      return bot.createMessage(msg.channel.id, {
        content,
        messageReference: {
          messageID: msg.id,
        }
      })
    }
  }

  if(!pm.runner.doesCommandExist(command)) return response.send("Command not found!");

  pm.runner.run(command, request, response)
})

bot.on("connect", (err) => {
  console.log("yeye");
})

bot.connect()