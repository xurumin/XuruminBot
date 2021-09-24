const Discord = require('discord.js');
const Utils = require("./../../utils/utils")
const fs = require("fs")

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
		let text = args.join(" ").slice(0, 218)
		text = text.replace(/\n/gi, ' ')

		if (args.length <= 0) {
			text = await (await message.channel.messages.fetch({
				limit: 2
			})).last()["content"]
		}

		if (text == "") {
			return message.send_(
				Utils.createSimpleEmbed(LOCALE.errors.cmd_format.title, Utils.stringTemplateParser(LOCALE.errors.cmd_format.description, {
					prefix: process.env.COMMAND_PREFIX
				}))
			);
		}

		var img_code = 3;
		if (text.length <= 74) img_code = 1;
		if (text.length > 74 && text.length <= 151) img_code = 2;

		try {
			const res = await Utils.KarinnaAPI.get("/v1/image/bolsonarotweet", {
				text: text
			})
			return message.inlineReply(new Discord.MessageAttachment(res, "tweet.jpg"));	
		} catch (error) {
			return Promise.reject("Não foi possível conectar na api da Karinna");
		}
	},

	get command() {
		return {
			name: 'bolsonarotweet',
			aliases: [
				"bolsonarotwt",
				"bolsotwt"
			]
		};
	},
};