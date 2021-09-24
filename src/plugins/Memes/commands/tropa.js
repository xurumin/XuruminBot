"use strict";

const Discord = require('discord.js');
const path = require("path");
const Utils = require("./../../../utils/utils");
require('dotenv/config');

module.exports = {
    validate(client, message) {
        return true;
    },
    /**
     * @param  {Discord.Client} client
     * @param  {Discord.Message} message
     * @param  {} args
     */
    run: async (client, message, args, LOCALE) => {
        return new Promise((resolve, reject) => {

            const tagged_user = message.mentions.users.entries().next();
            var user = message.author;
            if (tagged_user.value) user = tagged_user.value[1];

            var embed = new Discord.MessageEmbed();
            embed.setTitle(LOCALE.title);

            if(Number.parseInt(user.id.split("").pop()) % 2 == 0){
                embed.setDescription(LOCALE.true.interpolate({
                    user: user
                }));
                return message.send_(embed);

            }else{
                embed.setDescription(LOCALE.false.interpolate({
                    user: user
                }));
                return message.send_(embed);
            }

        });
    },
    get command() {
        return {
            name: 'tropa'
        };
    },
};