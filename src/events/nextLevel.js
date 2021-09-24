const Discord = require('discord.js');
const Utils = require('../utils/utils');
const Payment = require("../libs/Payment");
require('dotenv/config');

module.exports = {
	/**
	 * @param  {Discord.Client} client
	 * @param  {Discord.Collection} locale_list
	 * @param  {} args
	 */
	run: async (client, userInfo, locale_list) => {
		//guild.region

		const LANGUAGE = "pt_BR";
		const DEFAULT_LANGUAGE = "pt_BR";
		var LOCALE;

		if(locale_list.has(LANGUAGE)){
			LOCALE = locale_list.get(LANGUAGE);
		}else{
			LOCALE = locale_list.get(DEFAULT_LANGUAGE);
		}
		const prize = Utils.random(50,150);
		var user = client.users.cache.find(user=>user.id==userInfo.userId);
		user.send({
			content: LOCALE["events"]["nextLevel"].message.interpolate({
				user: user,
				new_level: userInfo.newLevel,
				prize: prize,
				prefix: process.env.COMMAND_PREFIX
			})
		});
		return await Payment.fastPayXurumin(userInfo.userId, prize);

	},

	get event() {
		return {
			eventName: 'nextLevel'
		};
	},
};