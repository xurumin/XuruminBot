const Discord = require('discord.js');
const database = require("./../../utils/database")
const Utils = require("./../../utils/utils")
const fs = require("fs")

module.exports = {
	validate(client, message) {
		return true;
	},
	/**
	 * @param  {Discord.Client} client
	 * @param  {Discord.Message} message
	 * @param  {} args
	 */
	run: async (client, message, args, LOCALE) => {
		if (!message.mentions.users.size > 0) {
			return message.channel.send(
                Utils.createSimpleEmbed(LOCALE.errors.cmd_format.title, LOCALE.errors.cmd_format.description.interpolate({prefix: process.env.COMMAND_PREFIX}))
            );

		}
		let metioned_user = message.mentions.users.entries().next().value[1]

		if(message.author == metioned_user){
			return message.channel.send(
				Utils.createSimpleEmbed(LOCALE.errors.auto_crush.title, LOCALE.errors.auto_crush.description)
			)
		}

		if(metioned_user == client.user){
			return message.channel.send(
				Utils.createSimpleEmbed(LOCALE.errors.tag_bot.title,LOCALE.errors.tag_bot.description)
			)
		}

		let sent_1 = LOCALE.word_lists[0]
		sent_1 = sent_1[Math.floor(Math.random() * sent_1.length)]

		let sent_2 = LOCALE.word_lists[1]
		sent_2 = sent_2[Math.floor(Math.random() * sent_2.length)]

		let sent_3 = LOCALE.word_lists[2]
		sent_3 = sent_3[Math.floor(Math.random() * sent_3.length)]

		let sent_4 = LOCALE.word_lists[3]
		sent_4 = sent_4[Math.floor(Math.random() * sent_4.length)]
		

		return message.channel.send(
			new Discord.MessageEmbed()
			.setTitle(LOCALE.message.title)
			.setDescription(
				LOCALE.message.description.interpolate({
					metioned_user: metioned_user,
					sent_1: sent_1,
					sent_2: sent_2,
					sent_3: sent_3,
					sent_4: sent_4
				})
			)
			.setThumbnail(message.author.avatarURL())
			.setFooter(LOCALE.message.footer.interpolate({author: message.author}))
		)

	},

	get command() {
		return {
			name: 'crush'
		};
	},
};