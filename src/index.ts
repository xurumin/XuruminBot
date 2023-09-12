import Eris, { Command } from "eris";
import { PluginManager } from "./libs/PluginManager";
import { Request } from "./libs/PluginManager/@types/Request";
import { Response } from "./libs/PluginManager/@types/Response";

const TOKEN = process.env.DISCORD_TOKEN as string;
const PREFIX = process.env.COMMAND_PREFIX as string;

const bot = Eris(TOKEN, {
  intents: [
    "guildMembers",
    "guildMessages",
    "guildVoiceStates",
  ]
})

const pm = new PluginManager(import.meta.dir + "/plugins")

bot.on("interactionCreate", (interaction: Eris.CommandInteraction) => {
  const request: Request = {
    content: interaction.data?.name || "",
    createdAt: Date.now(),
    sender: {
      avatar: interaction.member?.user.avatar || "",
      id: interaction.member?.user.id || "",
      isBot: interaction.member?.user.bot || false,
      name: interaction.member?.user.username || "",
    },
    interaction
  }

  const response: Response = {
    send: async (content, file) => {
      await interaction.createMessage(content, file)
    }
  }

  if (!pm.runner.doesCommandExist(interaction.data?.name || "")) return response.send("Command not found!");

  pm.runner.run(interaction.data?.name || "", request, response)
})

bot.on("ready", () => {
  console.log("Im ready");

  pm.init().then(() => {
    pm.runner.commands.forEach((command) => {

      if (process.env.NODE_ENV === "development") {        
        bot.createGuildCommand("452897137718722562", {
          name: command.name,
          description: command.description,
          type: 1,
          options: command.options
        })
      }
    })
  })
})

bot.connect()