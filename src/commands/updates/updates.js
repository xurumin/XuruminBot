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
	 * @param  {Array} args
	 */
	run: async (client, message, args, LOCALE) => {
		// var lastUpdates = (await axios.get(process.env.UPDATES_GIST)).data
		var embed = new Discord.MessageEmbed()
		embed.setTitle(LOCALE["message"].title)
		embed.setDescription(LOCALE["message"].description)
		// embed.setDescription(lastUpdates)
		// embed.setThumbnail(client.user.avatarURL())
        return message.channel.send(embed);
	},

	get command() {
        return {
            name: 'updates',
			aliases: [
				"novidades"
			]
		};
	},
};