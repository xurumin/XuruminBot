"use strict";
const Discord = require('discord.js');
const Utils = require("./../../../utils/utils")
const config = require("./../../../config");
const os = require('os');
require('dotenv/config');


const getVoiceConnectionsCount = async (client) => {
    const req = await client.shard.fetchClientValues('voice.connections.size');
    return req.reduce((p, n) => p + n, 0);
  }
  
  const getServerCount = async (client) => {
    const req = await client.shard.fetchClientValues('guilds.cache.size');
    return req.reduce((p, n) => p + n, 0);
  }

const formatMemoryUsage = (data) => `${Math.round(data / 1024 / 1024 * 100) / 100} MB`
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
                return message.channel.send("Sorry you can not send this command.")
            }
            var txt = "";
            txt += `Voice connections: ${await getVoiceConnectionsCount(client)}\n`
            txt+= `Server count: ${await getServerCount(client)}\n`
            txt+= `Memory: ${formatMemoryUsage(process.memoryUsage().heapUsed)}/${formatMemoryUsage(process.memoryUsage().heapTotal)}\n`
            txt+= `CPU usage: ${os.loadavg()}`
            return message.channel.send(txt)

        })
    },
    get command() {
        return {
            name: "getstatus",
            aliases: []
        }
    },
};