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

		return message.send_(
			new Discord.MessageEmbed()
			.setColor('#9d65c9')
			.setTitle(LOCALE.message.title)
			.setDescription(LOCALE.message.description)
		)
		
	},

	get command() {
		return {
			name: 'commands',
			aliases:[
				"comandos",
				"cmds"
			]
		};
	},
};