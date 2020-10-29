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
        return message.channel.send("https://www.youtube.com/watch?v=Jvl0L9GRH6o%22");
    },
    get command() {
        return {
            name: 'rapaz'
        };
    },
};