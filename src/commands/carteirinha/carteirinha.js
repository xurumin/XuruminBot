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
	
			message.channel.startTyping()
			const member = message.guild.member(message.author);
			const user_roles = member.roles.cache.sort((a, b) => a.position - b.position || a.id - b.id).map(r=>{ return r.name.replace(/[^a-z0-9 ,.?!]/ig, "")}).reverse().slice(0,3)			
			const carteirinha_list = LOCALE.word_list
			const tag = carteirinha_list[Math.floor(Math.random() * carteirinha_list.length)]

			ImageProcessor(message.author.avatarURL({
				format: "png"
			}), message.author.username, user_roles, tag)
			.then((image)=>{
				const embed = new Discord.MessageEmbed()
				.setColor('#9d65c9')
				.setTitle(LOCALE.message.title.interpolate({tag: tag}))
				.setAuthor(client.user.username)
				.setDescription(LOCALE.message.description.interpolate({author: message.author, tag:tag}))
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
			name: 'carteirinha',
			aliases: [
				"carteira"
			]
		};
	},
};