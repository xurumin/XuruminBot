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
			let text = args.join(" ").slice(0,23)
			text = text.replace(/\n/gi, ' ')
			if(args.length <= 0 || text==""){
				return message.channel.send(
					Utils.createSimpleEmbed("❌ Erro ao digitar comando:", `Use  **${process.env.COMMAND_PREFIX}indoatras <frase que você quiser>** para ir daquele que fez alquilo! 🤗`, client.user.username, client.user.avatarURL())
				);
			}
			message.channel.startTyping()

			setTimeout(() => {
				message.channel.stopTyping();
			}, 5000);

			Utils.KarinnaAPI.get("/v1/image/indoatras", {
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
			name: 'indoatras',
			aliases: [
				"indoatrasdessetalde",
				"indoatrasdesse",
				"iadtd"
			]
		};
	},
};