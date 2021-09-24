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
	run: async (client, message, args) => {
		return message.send_(
			new Discord.MessageEmbed()
			.setColor('#9d65c9')
			.setTitle("Juan")
			.setAuthor(client.user.username)
			.setImage("https://i.imgur.com/kWFFM2w.png")
		);
	},
	get command() {
		return {
			name: 'juan'
		};
	},
};