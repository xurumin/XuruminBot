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
		return message.channel.send(
			new Discord.MessageEmbed()
			.setColor('#9d65c9')
			.setTitle("Gatinho")
			.setDescription("🎶🎶 🥳🥳🥳")
			.setAuthor(client.user.username)
			.setImage("https://i.imgur.com/OmiPKRQ.gif")
		)
	},
	get command() {
		return {
			name: 'catbobbing',
			aliases: ["gatodancando","gatinhodancando","gatobalancando","catbobbinghead"]
		};
	},
};