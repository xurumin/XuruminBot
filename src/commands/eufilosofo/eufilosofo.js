const Discord = require('discord.js');
const Utils = require("./../../utils/utils");
const fs = require("fs");

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
			let text = args.join(" ").slice(0,220);
			text = text.replace(/\n/gi, ' ');
			if(args.length <= 0 ){
				text = await (await message.channel.messages.fetch({ limit: 2 })).last()["content"];
			}
	
			if(text == ""){
				return message.send_(
					Utils.createSimpleEmbed("❌ Erro ao digitar comando:", `Use  **${process.env.COMMAND_PREFIX}filosofo <frase que você quiser>** ou somente **${process.env.COMMAND_PREFIX}filosofo** que eu pego a ultima mensagem mandada! 🤗`)
				);
			}
	
			

			

			Utils.KarinnaAPI.get("/v1/image/eufilosofo", {
                text: text,
				username: message.author.username,
				img_url: message.author.avatarURL({
					format: "jpg",
					size: 512
				})
            }).then(async res=>{
				
				return resolve(message.inlineReply(new Discord.MessageAttachment(res, "image.jpg")));
            })
            .catch(async err=>{
                
				return reject(err);
            });
		});
	},

	get command() {
		return {
			name: 'eufilosofo',
			aliases: [
				"eufilo"
			]
		};
	},
};