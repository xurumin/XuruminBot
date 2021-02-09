const Discord = require('discord.js');
const utils = require('../utils/utils');
const MessageLog = require('./../utils/MessageLog');
const config = require("./../config")
require('dotenv/config');

const talkedRecently = new Discord.Collection();
const antiFloodCooldown = new Discord.Collection();

module.exports = {
	/**
	 * @param  {Discord.Client} client
	 * @param  {Discord.Message} message
	 * @param  {Discord.Collection} locale_list
	 * @param  {} args
	 */
	run: async (client, message, locale_list) => {


		if(!antiFloodCooldown.has(message.author.id)){
			if(client.cachedPoints.has(message.author.id)){
				client.cachedPoints.set(message.author.id, client.cachedPoints.get(message.author.id) + 1)
			}else{
				client.cachedPoints.set(message.author.id,1)
			}
			antiFloodCooldown.set(message.author.id);
			setTimeout(() => {
				antiFloodCooldown.delete(message.author.id);
			}, process.env.ANTI_FLOOD_MESSAGE_COOLDOWN);
		}

		if ( (!message.content.startsWith(process.env.COMMAND_PREFIX)) && !(message.content == `<@!${client.user.id}>`) ) return;

		//get guild language
		const LANGUAGE = "pt_BR"
		const DEFAULT_LANGUAGE = "pt_BR"
		var LOCALE;

		if(locale_list.has(LANGUAGE)){
			LOCALE = locale_list.get(LANGUAGE)
		}else{
			LOCALE = locale_list.get(DEFAULT_LANGUAGE)
		}


		if (talkedRecently.has(message.author.id)) {
			const currentTime = (new Date()).getTime()
			const pastTime = talkedRecently.get(message.author.id)
			const cooldown = ((process.env.MESSAGE_COOLDOWN/1000) - ((currentTime-pastTime)/1000)).toFixed(0)

			const embed = new Discord.MessageEmbed()
				.setTitle(LOCALE.events.message.cooldown.title)
				.setDescription(utils.stringTemplateParser(LOCALE.events.message.cooldown.description, {cooldown: cooldown}))
				.setColor('#8146DC')
			return message.channel.send(embed);
		}

		// Checks if sender is a Special User (who do not have message cooldown)
		if (!config.specialusers.includes(message.author.id)) talkedRecently.set( message.author.id, (new Date()).getTime());

		/**
		 * If bot was tagged
		 */

		LOCALE.events.message.bot_tagged.fields[0][0]

		if (message.content == `<@!${client.user.id}>`) {
			const embed = new Discord.MessageEmbed()
				.setTitle(utils.stringTemplateParser(LOCALE.events.message.bot_tagged.title, {username: client.user.username}))
				.setDescription(utils.stringTemplateParser(LOCALE.events.message.bot_tagged.description, {prefix: process.env.COMMAND_PREFIX}))
				.addField(LOCALE.events.message.bot_tagged.fields[0][0], process.env.COMMAND_PREFIX)
				.addField(LOCALE.events.message.bot_tagged.fields[1][0], `${process.env.COMMAND_PREFIX}help`)
				.addField(LOCALE.events.message.bot_tagged.fields[2][0], LOCALE.events.message.bot_tagged.fields[2][1])
				.addField(LOCALE.events.message.bot_tagged.fields[3][0], "https://github.com/jnaraujo/xurumin_discord_bot/")
				.addField(LOCALE.events.message.bot_tagged.fields[4][0], "https://xurumin.github.io/")
				.setThumbnail(client.user.avatarURL())
				.setColor('#8146DC')
				.setFooter(`All rights reserved @ ${client.user.username} - ${new Date().getFullYear()}`, client.user.avatarURL());;
			return message.channel.send(embed);
		}

		setTimeout(() => {
			talkedRecently.delete(message.author.id);
		}, process.env.MESSAGE_COOLDOWN);

		const args = message.content
			.slice(process.env.COMMAND_PREFIX.length)
			.trim()
			.split(/ +/g);

		const command = args.shift().toLowerCase();
		try {
			const cmd = client.commands.get(command);
			const aliase = client.aliases.get(command);

			if ((cmd || aliase) && config.blockedcommands.includes(command)) return message.channel.send(LOCALE.events.message.errors.blocked_command)
			if (cmd) {
				const response = await cmd.run(client, message, args, LOCALE.commands[command]);
				return MessageLog.log(message, response); // ADD MESSAGE TO MessageLog
			} else if (aliase) {
				const response = await client.commands.get(aliase).run(client, message, args, LOCALE.commands[aliase]);
				return MessageLog.log(message, response); // ADD MESSAGE TO MessageLog
			} else {
				return message.channel.send(
					new Discord.MessageEmbed()
					.setColor('#9d65c9')
					.setTitle(LOCALE.events.message.errors.command_not_found.title)
					.setDescription(LOCALE.events.message.errors.command_not_found.description)
					.addField(LOCALE.events.message.errors.command_not_found.fields[0][0],LOCALE.events.message.errors.command_not_found.fields[0][1])
					.addField(LOCALE.events.message.errors.command_not_found.fields[1][0],LOCALE.events.message.errors.command_not_found.fields[1][1])
					.addField(LOCALE.events.message.errors.command_not_found.fields[2][0],LOCALE.events.message.errors.command_not_found.fields[2][1])
					.setAuthor(client.user.username)
				)
			}
		} catch (error) {
			message.channel.stopTyping();
			console.log("[MESSAGE_EVENT]", error)
			return message.channel.send(utils.createSimpleEmbed(LOCALE.events.message.errors.cmd_run_error.title, LOCALE.events.message.errors.cmd_run_error.description , client.user.username, client.user.avatarURL()));
		}
	},

	get event() {
		return {
			eventName: 'message'
		};
	},
};