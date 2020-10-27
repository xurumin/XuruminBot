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
			.setTitle("Pedro")
			.setAuthor(client.user.username)
			.setImage("https://i.imgur.com/wp1QE7W.png")
		)
	},
	get command() {
		return {
			name: 'pedro'
		};
	},
};