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
			.addField("Lista de comandos", "http://bit.ly/xurumincomandos")
			.addField("Github do Xurumin", "http://bit.ly/xurumingithub")
			.addField("Site do Xurumin", "http://bit.ly/xurumin")
			.setAuthor(client.user.username)
			.setImage(res.data["results"][0]["urls"]["small"])
		)
		
	},

	get command() {
		return {
			name: 'help'
		};
	},
};