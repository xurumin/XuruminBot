const Discord = require('discord.js');
const Utils = require("./../../utils/utils")

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
		var user_image;
		if (message.mentions.users.size > 0) {
			user_image = message.mentions.users.entries().next().value[1].avatarURL({
				format: "jpg",
				size: 512
			})

		} else {
			user_image = message.author.avatarURL({
				format: "jpg",
				size: 512
			})
		}

		Utils.KarinnaAPI.get("/v1/image/gatinhodamamae", {
			img_url: user_image
		}).then(async res=>{
			return message.inlineReply(new Discord.MessageAttachment(res, "image.jpg"))
		})
		.catch(async err=>{
			message.channel.stopTyping()
			return err
		})

	},

	get command() {
		return {
			name: 'gatinhodamamae'
		};
	},
};