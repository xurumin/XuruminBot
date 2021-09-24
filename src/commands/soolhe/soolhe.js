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
	run: (client, message, args) => {
		return new Promise(async(resolve, reject)=>{
			const metioned_user = message.mentions.users.entries().next();

			let user = message.author;
			if(metioned_user.value) user=metioned_user.value[1];

			

			Utils.KarinnaAPI.get("/v1/image/soolhe", {
				img_url: user.avatarURL({format:"jpg", size:512})
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
			name: 'soolhe'
		};
	},
};