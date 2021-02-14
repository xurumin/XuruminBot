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
	 * @param  {} args
	 */
	run: async (client, message, args, LOCALE) => {
		if(args.length <= 0){
			return message.channel.send(
                Utils.createSimpleEmbed(LOCALE.errors.cmd_format.title, LOCALE.errors.cmd_format.description.interpolate({prefix: process.env.COMMAND_PREFIX}))
            );
		}

		if(!args[0].includes("https://i.imgur.com/") || ((!args[0].endsWith(".png")) && (!args[0].endsWith(".jpg"))) ){
			return message.channel.send(
                Utils.createSimpleEmbed(LOCALE.errors.cmd_format.title, LOCALE.errors.cmd_format.description.interpolate({prefix: process.env.COMMAND_PREFIX}))
            );
		}
		try {
			var bg = await axios.request({method: "head", url: `${args[0]}`})
			var fileSize = bg.headers["content-length"]
			if( (fileSize/1024) > 200 ){
				return message.channel.send(
					Utils.createSimpleEmbed(LOCALE.errors.max_file_size_exceeded.title, LOCALE.errors.max_file_size_exceeded.description.interpolate({prefix: process.env.COMMAND_PREFIX}))
				);
			}
		} catch (error) {
			return message.channel.send(
                Utils.createSimpleEmbed(LOCALE.errors.invalid_url.title, LOCALE.errors.invalid_url.description.interpolate({prefix: process.env.COMMAND_PREFIX}))
            );
		}
		
		if(await Utils.Profile.hasProfile(client, message.author.id)){
			await Utils.Profile.setTag(client, message.author.id, "bg_url", `${args[0]}`)
			return message.channel.send(
                Utils.createSimpleEmbed(LOCALE.message.title, LOCALE.message.description.interpolate({prefix: process.env.COMMAND_PREFIX}))
            );
		}else{
			var standard_profile = Utils.Profile.getStandardProfile()
			await Utils.Profile.setProfile(client, message.author.id,`${args[0]}`,standard_profile.aboutme,standard_profile.level, standard_profile.points)

			return message.channel.send(
                Utils.createSimpleEmbed(LOCALE.message.title, LOCALE.message.description.interpolate({prefix: process.env.COMMAND_PREFIX}))
            );
		}
	},

	get command() {
		return {
			name: 'setbackground',
			aliases:[
				"setbg"
			]
		}
	},
};