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
		var meme = await axios.get(`https://xkcd.com/${Utils.random(0,2100)}/info.0.json`)
		return message.channel.send(
			new Discord.MessageEmbed()
			.setColor('#9d65c9')
			.setTitle(meme.data.safe_title)
			.setDescription(meme.data.alt)
			.setAuthor(client.user.username)
			.setImage(meme.data.img)
			.setFooter(`Photo by XKCD on https://xkcd.com`)
		)
	},

	get command() {
		return {
			name: 'xkcd'
		};
	},
};