const Discord = require('discord.js');
const database = require("./../../utils/database")
//
module.exports = {
	validate(client, message) {
		if (!message.member.hasPermission('MANAGE_GUILD')) {
			throw new Error('no_permission');
		}
	},
	/**
	 * @param  {Discord.Client} client
	 * @param  {Discord.Message} message
	 * @param  {} args
	 */
	run: async (client, message, args) => {
		//database.createDatabase()
		const time = 60 * 1000
		database.removeServer(message.guild.id)
		return message.channel.send("Canal removido!");
	},

	get command() {
		return {
			name: 'leave_channel',
			description: 'O canal irá parar de receber memes.',
			usage: 'leave',
		};
	},
};