const Discord = require('discord.js');
const Utils = require("./../../utils/utils");
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
			if (message.mentions.users.size > 0) {
				

				

				Utils.KarinnaAPI.get("/v1/image/funcionariodomes", {
					img_url: message.mentions.users.entries().next().value[1].avatarURL({format:"jpg", size:512})
				}).then(async res=>{
					
					return resolve(message.inlineReply(new Discord.MessageAttachment(res, "image.jpg")));
				})
				.catch(async err=>{
					
					return reject(err);
				});
	
			} else {
				return message.send_(
					Utils.createSimpleEmbed("❌ Erro ao digitar comando:", `Use  **${process.env.COMMAND_PREFIX}funcionariodomes @usuario** para dar o título de **Funcionário do Mês** 🤗`)
				);
			}
		});
	},

	get command() {
		return {
			name: 'funcionariodomes',
			aliases: [
				"fdm"
			]
		};
	},
};