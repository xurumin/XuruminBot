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
                Utils.createSimpleEmbed(LOCALE.errors.cmd_format.title, LOCALE.errors.cmd_format.description.interpolate({prefix: process.env.COMMAND_PREFIX}), client.user.username, client.user.avatarURL())
            );
		}
		if(!args[0].includes("https://unsplash.com/photos/")){
			return message.channel.send(
                Utils.createSimpleEmbed(LOCALE.errors.cmd_format.title, LOCALE.errors.cmd_format.description.interpolate({prefix: process.env.COMMAND_PREFIX}), client.user.username, client.user.avatarURL())
            );
		}
		try {
			var bg = await axios.get(`${args[0]}/download?force=true&w=640`)
		} catch (error) {
			return message.channel.send(
                Utils.createSimpleEmbed(LOCALE.errors.invalid_url.title, LOCALE.errors.invalid_url.description.interpolate({prefix: process.env.COMMAND_PREFIX}), client.user.username, client.user.avatarURL())
            );
		}
		
		if(Utils.Profile.hasProfile(client, message.author.id)){
			Utils.Profile.setTag(client, message.author.id, "bg_url", `${args[0]}/download?force=true&w=640`)
			return message.channel.send(
                Utils.createSimpleEmbed(LOCALE.message.title, LOCALE.message.description.interpolate({prefix: process.env.COMMAND_PREFIX}), client.user.username, client.user.avatarURL())
            );
		}else{
			var standard_profile = Utils.Profile.getStandardProfile()
			Utils.Profile.setProfile(client, message.author.id,`${args[0]}/download?force=true&w=640`,standard_profile.aboutme,standard_profile.level, standard_profile.points)
			
			return message.channel.send(
                Utils.createSimpleEmbed(LOCALE.message.title, LOCALE.message.description.interpolate({prefix: process.env.COMMAND_PREFIX}), client.user.username, client.user.avatarURL())
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