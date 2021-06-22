const Discord = require('discord.js');
const Utils = require("./../../utils/utils")
const axios = require("axios").default;


module.exports = {
	validate(client, message) {
		return true;
	},
	/**
	 * @param  {Discord.Client} client
	 * @param  {Discord.Message} message
	 * @param  {Array} args
	 */
	run: async (client, message, args, LOCALE) => {
		if(args.length <= 0){
			return message.channel.send(
                Utils.createSimpleEmbed(LOCALE.errors.cmd_format.title, LOCALE.errors.cmd_format.description.interpolate({prefix: process.env.COMMAND_PREFIX}))
            );
		}
		
		if(await Utils.Profile.hasProfile(client, message.author.id)){
			await Utils.Profile.setTag(client, message.author.id, "aboutme", args.join(" ").slice(0,250))
			return message.channel.send(
                Utils.createSimpleEmbed(LOCALE.message.title, LOCALE.message.description.interpolate({prefix: process.env.COMMAND_PREFIX}))
            );
		}else{
			var standard_profile = Utils.Profile.getStandardProfile()
			await Utils.Profile.setProfile(client, message.author.id,standard_profile.bg_url,args.join(" ").slice(0,250),standard_profile.level, standard_profile.points)
			return message.channel.send(
                Utils.createSimpleEmbed(LOCALE.message.title, LOCALE.message.description.interpolate({prefix: process.env.COMMAND_PREFIX}))
            );
		}
	},

	get command() {
		return {
			name: 'setaboutme',
			aliases:[
				"setabout",
				"aboutme",
				"sobremim",
				"mudarsobremim"
			]
		}
	},
};