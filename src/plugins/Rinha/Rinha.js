const Discord = require('discord.js');

module.exports = {
	validate(client, message) {
		if (!message.member.hasPermission('MANAGE_GUILD')) {
			throw new Error('no_permission');
		}
    },

	get commands() {
		return [
			require("./commands/aceitarrinha"),
            require("./commands/rinha"),
			require("./commands/boprarinha"),
			require("./commands/galosts"),
			require("./commands/galocreate"),
			
        ];
	},
};