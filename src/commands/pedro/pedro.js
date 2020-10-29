const Discord = require('discord.js');
const database = require("./../../utils/database");
const Utils = require("./../../utils/utils");
const fs = require("fs-extra")

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
		let pedro = fs.readdirSync(__dirname+"/files")
		pedro = pedro[Math.floor(Math.random() * pedro.length)]
		
		return message.channel.send(
			new Discord.MessageEmbed()
			.setColor('#9d65c9')
			.setTitle("Pedro")
			.setAuthor(client.user.username)
			.attachFiles(new Discord.MessageAttachment(`${__dirname}/files/${pedro}`, 'image.png'))
			.setImage("attachment://image.png")
		)
	},
	get command() {
		return {
			name: 'pedro'
		};
	},
};