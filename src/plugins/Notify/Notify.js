const Discord = require('discord.js');
const fs = require('fs-extra');

module.exports = {
	validate(client, message) {
		if (!message.member.hasPermission('MANAGE_GUILD')) {
			throw new Error('no_permission');
		}
    },

	get commands() {
		return {
			path: "commands"
		}
	},
};