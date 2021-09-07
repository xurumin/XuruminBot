"use strict";

const Discord = require('discord.js');
const database = require("./../../utils/database")
const Utils = require("./../../utils/utils")
const fs = require("fs");
const utils = require('./../../utils/utils');

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
		if (!message.mentions.users.size > 0) {
			var msg = {
				title: LOCALE.errors.user_not_tagged.title,
				description: LOCALE.errors.user_not_tagged.description
			}

			return message.send_(
				Utils.createSimpleEmbed(msg.title, msg.description)
			)

		}
		let metioned_user = message.mentions.members.toJSON()[0].user
		let metioned_user_2 = message.mentions.members.toJSON()[1].user

		if(message.author == metioned_user){
			var msg = {
				title: LOCALE.errors.auto_check.title,
				description: LOCALE.errors.auto_check.description
			}

			return message.send_(
				Utils.createSimpleEmbed(msg.title, msg.description)
			)
		}

		if(metioned_user == client.user){
			var msg = {
				title: LOCALE.errors["tag_bot"].title,
				description: LOCALE.errors["tag_bot"].description
			}

			return message.send_(
				Utils.createSimpleEmbed(msg.title, msg.description)
			)
		}

		var loading_msg_locale = {
			title: LOCALE.messages["loading"].title,
			description: LOCALE.messages["loading"].description
		}

		var loading_msg = await message.send_(
			new Discord.MessageEmbed()
			.setTitle(loading_msg_locale.title)
			.setDescription(loading_msg_locale.description)
		)

		setTimeout(()=>{
			var loaded_msg = {
				title: LOCALE.messages["loaded"].title,
				description: LOCALE.messages["loaded"].description.interpolate({
					tagged_user: metioned_user_2?metioned_user_2:metioned_user,
					tagged_user_2: metioned_user_2?metioned_user:message.author,
					result: utils.choice(LOCALE.results)
				})
			}
			var loaded_msg_embed = new Discord.MessageEmbed()
			.setTitle(loaded_msg.title)
			.setDescription(
				loaded_msg.description
			)
			.setThumbnail("https://i.imgur.com/8wzMv0f.png")
			loading_msg.edit_(loaded_msg_embed)
		}, 2000)

	},

	get command() {
		return {
			name: 'testedepaternidade',
			aliases:[
				"paternidade"
			]
		};
	},
};