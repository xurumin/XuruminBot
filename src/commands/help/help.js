const Discord = require('discord.js');
const database = require("./../../utils/database");
const Utils = require("./../../utils/utils");

const axios = require("axios").default;

module.exports = {
	validate(client, message) {
		if (!message.member.hasPermission('MANAGE_GUILD')) {
			throw new Error('no_permission');
		}
	},
	/**
	 * @param  {Discord.Client} client
	 * @param  {Discord.Message} message
	 * @param  {} args
	 */
	run: async (client, message, args) => {
		return message.channel.send(
			new Discord.MessageEmbed()
			.setColor('#9d65c9')
			.setTitle("Precisa de ajuda? 🤓")
			.addField("Lista de comandos", "https://github.com/jnaraujo/xurumin_discord_bot/blob/main/help/COMMANDS.ptbr.md")
			.addField("Github do Xurumin", "https://github.com/jnaraujo/xurumin_discord_bot/")
			.addField("Site do Xurumin", "https://xurumin.github.io/")
			.setAuthor(client.user.username)
		)
		
	},

	get command() {
		return {
			name: 'help'
		};
	},
};