const Discord = require('discord.js');
const database = require("./../../utils/database")

module.exports = {
	validate(client, message) {
		return true;
	},
	/**
	 * @param  {Discord.Client} client
	 * @param  {Discord.Message} message
	 * @param  {} args
	 */
	run: async (client, message, args) => {
		const m = await message.send_("Ping?");
        m.edit_(`Pong! Latency is ${m.createdTimestamp - message.createdTimestamp}ms. API Latency is ${Math.round(client.ws.ping)}ms`);
	},

	get command() {
		return {
			name: 'ping',
			description: 'Pong?',
			usage: 'ping',
		};
	},
};