const Discord = require('discord.js');
require('dotenv/config');

module.exports = {
	/**
	 * @param  {Discord.Client} client
	 * @param  {Discord.Message} message
	 * @param  {} args
	 */
	run: async (client, message) => {
		console.error('[#ERROR]', message)
	},

	get event() {
		return {
			eventName: 'error'
		};
	},
};