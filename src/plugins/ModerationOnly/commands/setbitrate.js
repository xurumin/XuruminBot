"use strict";
const Discord = require('discord.js');
const Utils = require("./../../../utils/utils")
const config = require("./../../../config");
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
        return new Promise(async (resolve, reject)=>{
            if(!config.specialusers.includes(message.author.id)){
                return message.send_("Sorry you can not send this command.")
            }

            var player = client.players.get(message.guild.id)

            if (!player) {
                return message.send_("ta tocando nada nao")
            } else {
                var newBitrate = Number.parseInt(args[0])
                if(!newBitrate) return;
                player.setBitrate(Number.parseInt(args[0]))
                return message.send_("bitrate alterado")
            }

        })
    },
    get command() {
        return {
            name: "setbitrate",
            aliases: []
        }
    },
};