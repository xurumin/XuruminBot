const Discord = require('discord.js');
const Utils = require('./../../../utils/utils');
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
			let text = args.join(" ").slice(0,220)
			text = text.replace(/\n/gi, ' ')
			if(args.length <= 0 ){
				text = await (await message.channel.messages.fetch({ limit: 2 })).last()["content"]
			}
			
			

			

			Utils.KarinnaAPI.get("/v1/image/filosofo", {
                text: text || ""
            }).then(async res=>{
				resolve(message.inlineReply(new Discord.MessageAttachment(res, "filosofo.jpeg")))
            })
            .catch(async err=>{
                
				message.inlineReply("Ocorreu um erro ao carregar esse comando. Mas não se preocupe! Nossos gatinhos estão trabalhando para resolver isso!")
				return reject(err)
            })
		})
	},

	get command() {
		return {
			name: 'filosofo',
			description: 'O que será que o filósofo disse?',
			usage: 'filosofo',
			aliases: [
				"filosofos",
				"filo"
			]
		};
	},
};