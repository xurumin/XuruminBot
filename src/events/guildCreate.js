const Discord = require('discord.js');
const utils = require('../utils/utils');
require('dotenv/config');

module.exports = {
	/**
	 * @param  {Discord.Client} client
	 * @param  {Discord.Guild} guild
	 * @param  {Discord.Collection} locale_list
	 * @param  {} args
	 */
	run: async (client, guild, locale_list) => {

		

		//guild.region

		const LANGUAGE = "pt_BR"
		const DEFAULT_LANGUAGE = "pt_BR"
		var LOCALE;

		if(locale_list.has(LANGUAGE)){
			LOCALE = locale_list.get(LANGUAGE)
		}else{
			LOCALE = locale_list.get(DEFAULT_LANGUAGE)
		}

		guild.fetchAuditLogs({type: "BOT_ADD", limit: 1}).then(log => { // Fetching 1 entry from the AuditLogs for BOT_ADD.
			var msg = LOCALE["events"]["guildCreate"]["message"].interpolate({
				prefix: process.env.COMMAND_PREFIX,
				server_name: guild.name
			})
			log.entries.first().executor.send(msg).catch(e => console.error(e)); // Sending the message to the executor.
		});


	},

	get event() {
		return {
			eventName: 'guildCreate'
		};
	},
};