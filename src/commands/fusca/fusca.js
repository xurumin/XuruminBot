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
		var image = await axios.get(`https://unsplash.com/napi/search/photos?query=beetle+car&xp=&per_page=1&page=${Utils.random(0,100)}`)
		return message.send_(
			new Discord.MessageEmbed()
			.setColor('#9d65c9')
			.setTitle("Vrum vrum! Olha o fuscão parceiro 🚗")
			.setAuthor(client.user.username)
			.setImage(image.data["results"][0]["urls"]["small"])
			.setFooter(`Photo by ${image.data["results"][0]["user"]["name"]} on Unsplash`)
		)
	},
	get command() {
		return {
			name: 'fusca',
			aliases: ["beetle"]
		};
	},
};