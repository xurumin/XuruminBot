const Discord = require('discord.js');
const fs = require('fs-extra');


module.exports = {
	validate(client, message) {
		return true
    },

	get commands() {
		return {
			path: "commands"
		}
	},
};