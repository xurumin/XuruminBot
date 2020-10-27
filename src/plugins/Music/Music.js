const Discord = require('discord.js');
const fs = require('fs-extra');


module.exports = {
	validate(client, message) {
		if (!message.member.hasPermission('MANAGE_GUILD')) {
			throw new Error('no_permission');
		}
    },

	get commands() {
		return [
			require("./commands/play"),
			require("./commands/queue"),
			require("./commands/skip"),
			require("./commands/spotify"),
			require("./commands/shuffle"),
			require("./commands/leave")
		]
		
	},
};