const Discord = require('discord.js');
const Utils = require("./../../utils/utils")
const fs = require("fs")

const ImageProcessor = require("./ImageProcessor")



module.exports = {
	validate(client, message) {
		return true;
	},
	/**
	 * @param  {Discord.Client} client
	 * @param  {Discord.Message} message
	 * @param  {Array} args
	 */
	run: (client, message, args, LOCALE) => {
		return new Promise(async(resolve, reject)=>{
			let text = args.join(" ").slice(0,218)
			text = text.replace(/\n/gi, ' ')

			if(args.length <= 0 ){
				text = await (await message.channel.messages.fetch({ limit: 2 })).last()["content"]
			}
	
			if(text == ""){
				return message.channel.send(
					Utils.createSimpleEmbed(LOCALE.errors.cmd_format.title, Utils.stringTemplateParser(LOCALE.errors.cmd_format.description, {prefix: process.env.COMMAND_PREFIX}), client.user.username, client.user.avatarURL())
				);
			}
	
			message.channel.startTyping()
			setTimeout(() => {
				message.channel.stopTyping();
			}, 5000);
			var img_code = 3;
			if(text.length <= 74) img_code=1;
			if(text.length > 74 && text.length <= 151) img_code=2;
	
			ImageProcessor(text, img_code)
			.then((image)=>{
				const embed = new Discord.MessageEmbed()
				.setColor('#9d65c9')
				.setTitle(LOCALE.message.title)
				.setAuthor(LOCALE.message.author)
				.setDescription(Utils.stringTemplateParser(LOCALE.message.description,{author:message.author.username}))
				.attachFiles(image)
				.setImage("attachment://image.png")
				message.channel.stopTyping()
				resolve(message.channel.send(embed))
			})
			.catch((err)=>{
				message.channel.stopTyping()
				reject(err)
			})
		})
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