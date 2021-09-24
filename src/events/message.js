"use strict";

const Discord = require('discord.js');
const utils = require('../utils/utils');
const MessageLog = require('./../utils/MessageLog');
const config = require("./../config");
require('dotenv/config');

var Sentry;
if(process.env.NODE_ENV != "development"){
	Sentry = require("@sentry/node");

	Sentry.init({
		dsn: process.env.SENTRY_DNS
	});
}

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

		message.inlineReply = async (msg)=>{
			if(msg instanceof Discord.MessageAttachment){
				return await message.channel.send({
					files: [msg],
					reply: { messageReference: message.id }
				})
			}
			else if(msg instanceof Discord.MessageEmbed){
				return await message.channel.send({
					embeds: [msg],
					reply: { messageReference: message.id }
				})
			}else{
				return await message.channel.send({
					content: msg,
					reply: { messageReference: message.id }
				})
			}
		}
		message.send_ = async (msg)=>{
			if(msg instanceof Discord.MessageAttachment){
				return await message.channel.send({
					files: [msg]
				})
			}
			else if(msg instanceof Discord.MessageEmbed){
				return await message.channel.send({
					embeds: [msg]
				})
			}else{
				return await message.channel.send({
					content: msg,
					reply: { messageReference: message.id }
				})
			}
		}
		message.edit_ = async (msg)=>{
			if(msg instanceof Discord.MessageAttachment){
				return await message.edit({
					files: [msg]
				})
			}
			else if(msg instanceof Discord.MessageEmbed){
				return await message.edit({
					embeds: [msg]
				})
			}else{
				return await message.edit({
					content: msg
				})
			}
		}

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
		if(client.userBanList[message.author.id]) return message.send_("Sorry. You are banned.")


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
			return message.send_(embed);
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
				.setFooter(`All rights reserved @ ${client.user.username} - ${new Date().getFullYear()}`, client.user.avatarURL());
			return message.send_(embed);
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

			if ((cmd || aliase) && (config.blockedcommands.includes(command)) || config.blockedcommands.includes(aliase) ) return message.send_(LOCALE.events.message.errors.blocked_command);

			message.channel.sendTyping();
			
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
				var similar_cmd = client.commands.find(elm => utils.similarity(elm.command.name, command) > 0.7)
				if(similar_cmd) similar_cmd = similar_cmd.command.name

				var similar_aliase = client.aliases_array.find(elm => utils.similarity(elm[0], command) > 0.7)
				if(similar_aliase) similar_aliase = similar_aliase[0]

				if(!similar_cmd) similar_cmd = similar_aliase

				var embed = new Discord.MessageEmbed()
				.setColor('#9d65c9')
				.setTitle(LOCALE.events.message.errors.command_not_found.title)
				.setDescription(LOCALE.events.message.errors.command_not_found.description)
				.addField(LOCALE.events.message.errors.command_not_found.fields[0][0], LOCALE.events.message.errors.command_not_found.fields[0][1])
				.addField(LOCALE.events.message.errors.command_not_found.fields[1][0], LOCALE.events.message.errors.command_not_found.fields[1][1])
				.addField(LOCALE.events.message.errors.command_not_found.fields[2][0], LOCALE.events.message.errors.command_not_found.fields[2][1])
				.setAuthor(client.user.username)

				var cmdButton;
				if(similar_cmd){
					cmdButton = new Discord.MessageActionRow()
						.addComponents(
							new Discord.MessageButton()
								.setCustomId(`cmd_similar`)
								.setLabel(`Run ${process.env.COMMAND_PREFIX}${similar_cmd}`)
								.setStyle('SECONDARY'),
						);

					embed.setDescription(LOCALE.events.message.errors.command_not_found.description_similar.interpolate({
						prefix: process.env.COMMAND_PREFIX,
						cmd: similar_cmd
					}))

					message.ncontent = message.content.replace(`${command}`, similar_cmd)

					client.similarCmdUserMsg.set(message.author.id, message)
					
					setTimeout(()=>{
						client.similarCmdUserMsg.delete(message.author.id)
					}, 30000)
					cmdButton = [cmdButton]
				}

				message.reply({
					embeds: [embed],
					components: cmdButton ?? []
				})
				return MessageLog.log("NOT FOUND", message);
			}
		} catch (error) {
			if(process.env.NODE_ENV != "development"){
				Sentry.captureException(error)
			}
			console.log("[MESSAGE_EVENT]", error)
			
			return message.send_(utils.createSimpleEmbed(LOCALE.events.message.errors.cmd_run_error.title, LOCALE.events.message.errors.cmd_run_error.description));
		}
	},

	get event() {
		return {
			eventName: 'messageCreate'
		};
	},
};