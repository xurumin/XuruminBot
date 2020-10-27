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
		axios
		.get(`https://xkcd.com/${Utils.random(0,2100)}/info.0.json`)
		.then((res) => {
			return message.channel.send(
				new Discord.MessageEmbed()
				.setColor('#9d65c9')
				.setTitle(res.data.safe_title)
				.setDescription(res.data.alt)
				.setAuthor(client.user.username)
				.setImage(res.data.img)
				.setFooter(`Photo by XKCD on https://xkcd.com`)
			)
		})
		.catch((err) => {
			console.log(err)
			return message.channel.send(Utils.getErrorMessage());
		})
	},

	get command() {
		return {
			name: 'xkcd'
		};
	},
};