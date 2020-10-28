const Discord = require('discord.js');
const utils = require('../utils/utils');
const MessageLog = require('./../utils/MessageLog');
require('dotenv/config');

const talkedRecently = new Set();
module.exports = {
	/**
	 * @param  {Discord.Client} client
	 * @param  {Discord.Message} message
	 * @param  {} args
	 */
	run: async (client, message) => {
		/**
		 * Se a mensagem do bot for o @ do bot
		 */
		if (message.content == `<@!${client.user.id}>`) {
			const embed = new Discord.MessageEmbed()
			.setTitle(`Oi! Meu nome é ${client.user.username}! 😁`)
			.setDescription(`Para me usar, basta utilizar o prefixo **${process.env.COMMAND_PREFIX}** + o comando que você quiser! 🤓\nExperimenta usar **>meme** 🤠`)
			.addField('Prefixo', process.env.COMMAND_PREFIX)
			.addField('Ajuda?', `${process.env.COMMAND_PREFIX}help`)
			.addField("Lista de comandos", "https://github.com/jnaraujo/xurumin_discord_bot/blob/main/help/COMMANDS.ptbr.md")
			.addField("Github do Xurumin", "https://github.com/jnaraujo/xurumin_discord_bot/")
			.addField("Site do Xurumin", "https://xurumin.github.io/")
			.setThumbnail(client.user.avatarURL())
			.setColor('#8146DC')
			.setFooter(`All rights reserved @ ${client.user.username} - ${new Date().getFullYear()}`, client.user.avatarURL());;
			return message.channel.send(embed);
		}

		if (message.content.startsWith(process.env.COMMAND_PREFIX)) {
			if (talkedRecently.has(message.author.id)){
				const embed = new Discord.MessageEmbed()
					.setTitle('Calma lá, amigo! 🖐')
					.setDescription(`Você precisa esperar **5 segundos** antes de mandar outra mensagem! 🤠`)
					.setColor('#8146DC')
				return message.channel.send(embed);
			}
			talkedRecently.add(message.author.id);
			setTimeout(() => {
				talkedRecently.delete(message.author.id);
			}, process.env.MESSAGE_COOLDOWN); 
			const args = message.content
			.slice(process.env.COMMAND_PREFIX.length)
			.trim()
			.split(/ +/g);

			const command = args.shift().toLowerCase();
			try {
				const cmd = client.commands.get(command);
				const aliase = client.aliases.get(command);
				if (cmd){
					const response = await cmd.run(client, message, args);
					return MessageLog.log(message, response); // ADD MESSAGE TO MessageLog
				}else if (aliase){
					const response =  await client.commands.get(aliase).run(client, message, args);
					return MessageLog.log(message, response); // ADD MESSAGE TO MessageLog
				}
			} catch (error) {
				if(message.channel.typing) message.channel.stopTyping();
				console.log(error)
				return utils.createSimpleEmbed("❌ Erro ao executar comando:", `O serviço está temporariamente indisponível 😞\nNossos gatinhos programadores estão fazendo o possível para resolver isso 🤗`, client.user.username, client.user.avatarURL())

			}
			
		}
	},

	get event() {
		return {
			eventName: 'message'
		};
	},
};