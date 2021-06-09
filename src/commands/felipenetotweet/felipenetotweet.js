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
			let text = args.join(" ").slice(0,218)
			text = text.replace(/\n/gi, ' ')
			if(args.length <= 0 ){
				text = await (await message.channel.messages.fetch({ limit: 2 })).last()["content"]
			}
	
			if(text == ""){
				return message.channel.send(
					Utils.createSimpleEmbed("❌ Erro ao digitar comando:", `Use  **${process.env.COMMAND_PREFIX}monarktweet <frase que você quiser>** ou somente **${process.env.COMMAND_PREFIX}monarktweet** que eu pego a ultima mensagem mandada! 🤗`, client.user.username, client.user.avatarURL())
				);
			}
	
			message.channel.startTyping()
			setTimeout(() => {
				message.channel.stopTyping();
			}, 5000);
			var img_code = 3;
			if(text.length <= 74) img_code=1;
			if(text.length > 74 && text.length <= 151) img_code=2;

			Utils.KarinnaAPI.get("/v1/image/felipenetotweetfd", {
                text: text
            }).then(async res=>{
				resolve(message.inlineReply(new Discord.MessageAttachment(res, "tweet.jpg")))
            })
            .catch(async err=>{
                message.channel.stopTyping()
				return reject(err)
            })
		})
	},

	get command() {
		return {
			name: 'felipenetotweet',
			aliases: [
				"felipeneto",
				"felipinho",
				"felipenetotwt",
				"felipetwt"
			]
		};
	},
};