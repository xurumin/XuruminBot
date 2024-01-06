import Eris, { CommandInteraction, ComponentInteraction } from "eris";
import { PluginManager } from "./libs/PluginManager";
import { Context } from "./libs/PluginManager/@types/context";

const TOKEN = process.env.DISCORD_TOKEN as string;

const bot = Eris(TOKEN, {
  intents: [
    "guildMembers",
    "guildMessages",
    "guildVoiceStates",
  ]
})

const pm = new PluginManager(import.meta.dir + "/plugins")

bot.on("interactionCreate", (interaction) => {
  // inreactions with buttons, select menus, etc
  if(interaction instanceof ComponentInteraction) {
    return pm.runner.runInteraction(interaction);
  }

  if( interaction instanceof CommandInteraction) {
    const context: Context = {
      message: {
        content: interaction.data?.name || "",
        createdAt: interaction.createdAt,
        id: interaction.id,
      },
      sender: {
        avatar: interaction.member?.user.avatar || "",
        id: interaction.member?.user.id || "",
        isBot: interaction.member?.user.bot || false,
        name: interaction.member?.user.username || "",
      },
      interaction,
      eris: bot,
      send: async (content, file) => {
        if (typeof content !== "string") {
          content.flags = content.ephemeral ? 64 : 0;
        }
        
        await interaction.createMessage(content, file)
      }
    }  

    if (!pm.runner.doesCommandExist(interaction.data?.name || "")) return context.send("Command not found!");

    pm.runner.run(interaction.data?.name || "", context)
  }
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