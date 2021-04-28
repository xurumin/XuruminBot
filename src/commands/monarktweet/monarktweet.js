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
	run: (client, message, args) => {
		return new Promise(async(resolve, reject)=>{
			let text = args.join(" ").slice(0,218)
			text = text.replace(/\n/gi, ' ')
			if(args.length <= 0 ){
				text = "Wow"
			}
	
			message.channel.startTyping()

			setTimeout(() => {
				message.channel.stopTyping();
			}, 5000);
			
			var img_code = 3;
			if(text.length <= 74) img_code=1;
			if(text.length > 74 && text.length <= 151) img_code=2;
	
			Utils.KarinnaAPI.get("/v1/image/monarktweet", {
                text: text
            }).then(async res=>{
				message.channel.stopTyping();
				return resolve(message.inlineReply(new Discord.MessageAttachment(res, "image.jpg")))
            })
            .catch(async err=>{
                message.channel.stopTyping()
				return reject(err)
            })
		})
	},

	get command() {
		return {
			name: 'monarktweet',
			aliases: [
				"monarktw",
				"monarktwt",
				"mktwt"
			]
		};
	},
};