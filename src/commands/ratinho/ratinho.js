const Discord = require('discord.js');
const database = require("./../../utils/database");
const Utils = require("./../../utils/utils");

const axios = require("axios").default;

module.exports = {
	validate(client, message) {
		return true;
	},
	/**
	 * @param  {Discord.Client} client
	 * @param  {Discord.Message} message
	 * @param  {Array} args
	 */
	run: async (client, message, args) => {
        return message.send_("https://www.youtube.com/watch?v=-d6wB4KyuUk&list=PLJxFlYsd38rLghWxPrtoX2mL7jXCrZq_M&index=12");
	},

	get command() {
        return {
            name: 'ratinho'
		};
	},
};