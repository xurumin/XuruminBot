const Discord = require('discord.js');
const utils = require('../utils/utils');
const MessageLog = require('./../utils/MessageLog');
const config = require("./../config")
require('dotenv/config');

const talkedRecently = new Discord.Collection();;

module.exports = {
	/**
	 * @param  {Discord.Client} client
	 * @param  {Discord.Message} message
	 * @param  {} args
	 */
	run: async (client, message) => {

		if ( (!message.content.startsWith(process.env.COMMAND_PREFIX)) && !(message.content == `<@!${client.user.id}>`) ) return;

		if (talkedRecently.has(message.author.id)) {
			const currentTime = (new Date()).getTime()
			const pastTime = talkedRecently.get(message.author.id)

			const embed = new Discord.MessageEmbed()
				.setTitle('Calma lá, amigo! 🖐')
				.setDescription(`Você precisa esperar **${((process.env.MESSAGE_COOLDOWN/1000) - ((currentTime-pastTime)/1000)).toFixed(0)} segundos** antes de mandar outra mensagem! 🤠`)
				.setColor('#8146DC')
			return message.channel.send(embed);
		}

		// Checks if sender is a Special User (who do not have message cooldown)
		if (!config.specialusers.includes(message.author.id)) talkedRecently.set( message.author.id, (new Date()).getTime());

		/**
		 * Se o usuário marcar o bot
		 */
		if (message.content == `<@!${client.user.id}>`) {
			const embed = new Discord.MessageEmbed()
				.setTitle(`Oi! Meu nome é ${client.user.username}! 😁`)
				.setDescription(`Para me usar, basta utilizar o prefixo **${process.env.COMMAND_PREFIX}** + o comando que você quiser! 🤓\nExperimenta usar **${process.env.COMMAND_PREFIX}meme** 🤠`)
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
			if ((cmd || aliase) && config.blockedcommands.includes(command)) return message.channel.send("Este comando está temporariamente bloqueado.")
			if (cmd) {
				const response = await cmd.run(client, message, args);
				return MessageLog.log(message, response); // ADD MESSAGE TO MessageLog
			} else if (aliase) {
				const response = await client.commands.get(aliase).run(client, message, args);
				return MessageLog.log(message, response); // ADD MESSAGE TO MessageLog
			} else {
				return message.channel.send(
					new Discord.MessageEmbed()
					.setColor('#9d65c9')
					.setTitle("Não achei esse comando 😞")
					.setDescription("Se precisar de ajuda, aqui vai alguns links que podem ser úteis 🤗")
					.addField("Lista de comandos", "https://github.com/jnaraujo/xurumin_discord_bot/blob/main/help/COMMANDS.ptbr.md")
					.addField("Site do Xurumin", "https://xurumin.github.io/")
					.addField("Github do Xurumin", "https://github.com/jnaraujo/xurumin_discord_bot/")
					.setAuthor(client.user.username)
				)
			}
		} catch (error) {
			message.channel.stopTyping();
			console.log("[MESSAGE_EVENT]", error)
			return message.channel.send(utils.createSimpleEmbed("❌ Erro ao executar comando:", `Este comando está *TEMPORARIAMENTE* indisponível 😞\nNossos gatinhos programadores estão fazendo o possível para resolver isso 🤗`, client.user.username, client.user.avatarURL()));
		}
	},

	get event() {
		return {
			eventName: 'message'
		};
	},
};