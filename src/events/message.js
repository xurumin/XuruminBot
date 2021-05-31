"use strict";

const Discord = require('discord.js');
const utils = require('../utils/utils');
const MessageLog = require('./../utils/MessageLog');
const config = require("./../config");
require('dotenv/config');

const talkedRecently = new Discord.Collection();
const antiFloodCooldown = new Discord.Collection();


function addPoint(client, userId) {
	if (client.cachedPoints.has(userId)) {
		client.cachedPoints.set(userId, client.cachedPoints.get(userId) + 1)
	} else {
		client.cachedPoints.set(userId, 1)
	}
}

module.exports = {
	/**
	 * @param  {Discord.Client} client
	 * @param  {Discord.Message} message
	 * @param  {Discord.Collection} locale_list
	 * @param  {} args
	 */
	run: async (client, message, locale_list) => {

		// if(!antiFloodCooldown.has(message.author.id)){
		// 	if(client.cachedPoints.has(message.author.id)){
		// 		client.cachedPoints.set(message.author.id, client.cachedPoints.get(message.author.id) + 1)
		// 	}else{
		// 		client.cachedPoints.set(message.author.id,1)
		// 	}
		// 	antiFloodCooldown.set(message.author.id);
		// 	setTimeout(() => {
		// 		antiFloodCooldown.delete(message.author.id);
		// 	}, process.env.ANTI_FLOOD_MESSAGE_COOLDOWN);
		// }

		if ((!message.content.toLocaleLowerCase().startsWith(process.env.COMMAND_PREFIX)) && !(message.content.startsWith(`<@!${client.user.id}>`) || message.content.startsWith(`<@${client.user.id}>`))) return;

		//get guild language
		const LANGUAGE = message.guild ? message.guild.preferredLocale.replace("-", "_") : "pt_BR"
		const DEFAULT_LANGUAGE = "pt_BR"
		var LOCALE;

		if (locale_list.has(LANGUAGE)) {
			LOCALE = locale_list.get(LANGUAGE)
		} else {
			LOCALE = locale_list.get(DEFAULT_LANGUAGE)
		}

		// Checks if user is banned.
		if(client.userBanList[message.author.id]) return message.channel.send("Sorry. You are banned.")


		if (talkedRecently.has(message.author.id)) {
			const currentTime = (new Date()).getTime()
			const cooldownInfo = talkedRecently.get(message.author.id)
			const cooldown = ((cooldownInfo.total / 1000) - ((currentTime - cooldownInfo.time) / 1000)).toFixed(0)

			const embed = new Discord.MessageEmbed()
				.setTitle(LOCALE.events.message.cooldown.title)
				.setDescription(utils.stringTemplateParser(LOCALE.events.message.cooldown.description, {
					cooldown: cooldown
				}))
				.setColor('#8146DC')
			return message.channel.send(embed);
		}
		/**
		 * If bot was tagged
		 */
		if (message.content.replace(/ /g, "") == `<@!${client.user.id}>` || message.content.replace(/ /g, "") == `<@${client.user.id}>`) {
			const embed = new Discord.MessageEmbed()
				.setTitle(utils.stringTemplateParser(LOCALE.events.message.bot_tagged.title, {
					username: client.user.username
				}))
				.setDescription(utils.stringTemplateParser(LOCALE.events.message.bot_tagged.description, {
					prefix: process.env.COMMAND_PREFIX
				}))
				.addField(LOCALE.events.message.bot_tagged.fields[0][0], process.env.COMMAND_PREFIX)
				.addField(LOCALE.events.message.bot_tagged.fields[1][0], `${process.env.COMMAND_PREFIX}help`)
				.addField(LOCALE.events.message.bot_tagged.fields[2][0], LOCALE.events.message.bot_tagged.fields[2][1])
				.addField(LOCALE.events.message.bot_tagged.fields[3][0], LOCALE.events.message.bot_tagged.fields[3][1])
				.addField(LOCALE.events.message.bot_tagged.fields[4][0], LOCALE.events.message.bot_tagged.fields[4][1])
				.setThumbnail(client.user.avatarURL())
				.setColor('#8146DC')
				.setFooter(`All rights reserved @ ${client.user.username} - ${new Date().getFullYear()}`, client.user.avatarURL());;
			return message.channel.send(embed);
		}

		let args;
		if (message.content.trim().toLocaleLowerCase().startsWith(`<@!${client.user.id}>`)) {
			args = message.content
				.slice(`<@!${client.user.id}>`.length)
				.trim()
				.split(/ +/g);
		} else if (message.content.trim().toLocaleLowerCase().startsWith(`<@${client.user.id}>`)) {
			args = message.content
				.slice(`<@${client.user.id}>`.length)
				.trim()
				.split(/ +/g);
		} else {
			args = message.content
				.slice(process.env.COMMAND_PREFIX.length)
				.trim()
				.split(/ +/g);
		}
		const command = args.shift().toLowerCase();

		try {
			const cmd = client.commands.get(command);
			const aliase = client.aliases.get(command);

			// Checks if sender is a Special User (who do not have message cooldown)
			if (!(config.noCooldownCommands.includes(command) || config.noCooldownCommands.includes(aliase))) {
				addPoint(client, message.author.id)

				if (!config.specialusers.includes(message.author.id)) {
					const totalCooldown = process.env.MESSAGE_COOLDOWN

					talkedRecently.set(message.author.id, {
						time: (new Date()).getTime(),
						total: totalCooldown
					});
					setTimeout(() => {
						talkedRecently.delete(message.author.id);
					}, totalCooldown);
				}
			} else {
				const totalCooldown = 500
				talkedRecently.set(message.author.id, {
					time: (new Date()).getTime(),
					total: totalCooldown
				});
				setTimeout(() => {
					talkedRecently.delete(message.author.id);
				}, totalCooldown);
			}

			if ((cmd || aliase) && (config.blockedcommands.includes(command)) || config.blockedcommands.includes(aliase) ) return message.channel.send(LOCALE.events.message.errors.blocked_command)
			if (cmd) {
				//Register +1 cmd to log
				client.commandsSent++;

				const t1 = (new Date()).getTime()

				if(!LOCALE.commands[command]){
					LOCALE = locale_list.get(DEFAULT_LANGUAGE)
				}

				const response = await cmd.run(client, message, args, LOCALE.commands[command]);

				if (process.env.NODE_ENV == "development") {
					const t2 = (new Date()).getTime()
					console.log(`it took ${((t2-t1)).toFixed(2)} ms`)
				}

				return MessageLog.log(command, message); // ADD MESSAGE TO MessageLog
			} else if (aliase) {
				//Register +1 cmd to log
				client.commandsSent++;

				const t1 = (new Date()).getTime()

				if(!LOCALE.commands[aliase]){
					LOCALE = locale_list.get(DEFAULT_LANGUAGE)
				}

				const response = await client.commands.get(aliase).run(client, message, args, LOCALE.commands[aliase]);

				if (process.env.NODE_ENV == "development") {
					const t2 = (new Date()).getTime()
					console.log(`it took ${((t2-t1)).toFixed(2)} ms`)
				}

				return MessageLog.log(aliase, message); // ADD MESSAGE TO MessageLog
			} else {
				message.channel.send(
					new Discord.MessageEmbed()
					.setColor('#9d65c9')
					.setTitle(LOCALE.events.message.errors.command_not_found.title)
					.setDescription(LOCALE.events.message.errors.command_not_found.description)
					.addField(LOCALE.events.message.errors.command_not_found.fields[0][0], LOCALE.events.message.errors.command_not_found.fields[0][1])
					.addField(LOCALE.events.message.errors.command_not_found.fields[1][0], LOCALE.events.message.errors.command_not_found.fields[1][1])
					.addField(LOCALE.events.message.errors.command_not_found.fields[2][0], LOCALE.events.message.errors.command_not_found.fields[2][1])
					.setAuthor(client.user.username)
				)
				return MessageLog.log("NOT FOUND", message);
			}
		} catch (error) {
			message.channel.stopTyping();
			console.log("[MESSAGE_EVENT]", error)
			return message.channel.send(utils.createSimpleEmbed(LOCALE.events.message.errors.cmd_run_error.title, LOCALE.events.message.errors.cmd_run_error.description, client.user.username, client.user.avatarURL()));
		}
	},

	get event() {
		return {
			eventName: 'message'
		};
	},
};