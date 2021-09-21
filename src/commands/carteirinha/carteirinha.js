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
	run: (client, message, args, LOCALE) => {
		return new Promise(async(resolve, reject)=>{
	
			
			
			const member = message.guild.members.cache.get(message.author.id)


			const user_roles = member.roles.cache.sort((a, b) => a.position - b.position || a.id - b.id).map(r=>{ return r.name.replace(/[^a-z0-9 ,.?!]/ig, "")}).reverse().slice(0,3)			
			const carteirinha_list = LOCALE.word_list
			const tag = carteirinha_list[Math.floor(Math.random() * carteirinha_list.length)]

			Utils.KarinnaAPI.get("/v1/image/carteirinha", {
				img_url: message.author.avatarURL({format:"jpg", size:512}),
				roles: JSON.stringify(user_roles),
				tag: tag,
				username: message.author.username

			}).then(async res=>{
				
				return resolve(message.inlineReply(new Discord.MessageAttachment(res, "image.jpg")))
			})
			.catch(async err=>{
				
				return reject(err)
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