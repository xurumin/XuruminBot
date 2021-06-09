const Discord = require('discord.js');
const database = require("./../../utils/database");
const Utils = require("./../../utils/utils");

const axios = require("axios").default;

module.exports = {
	validate(client, message) {
		return true;
	},
	/**
	 * @param  {Discord.Client} client
	 * @param  {Discord.Message} message
	 * @param  {} args
	 */
	run: async (client, message, args, LOCALE) => {

		return message.channel.send(
			new Discord.MessageEmbed()
			.setColor('#9d65c9')
			.setTitle(LOCALE.message.title)
			.addField(LOCALE.message.fields[0][0],LOCALE.message.fields[0][1])
			.addField(LOCALE.message.fields[1][0],LOCALE.message.fields[1][1])
			.addField(LOCALE.message.fields[2][0],LOCALE.message.fields[2][1])
			.setAuthor(client.user.username)
		)
		
	},

	get command() {
		return {
			name: 'help',
			aliases:[
				"ajuda"
			]
		};
	},
};