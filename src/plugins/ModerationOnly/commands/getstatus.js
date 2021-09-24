"use strict";
const Discord = require('discord.js');
const Utils = require("./../../../utils/utils");
const config = require("./../../../config");
const os = require('os');
require('dotenv/config');
var pidusage = require('pidusage');

const getVoiceConnectionsCount = async (client) => {
    const req = await client.shard.fetchClientValues('voice.adapters.size');
    return req.reduce((p, n) => p + n, 0);
};
const getPlayers = async (client) => {
    const req = await client.shard.fetchClientValues('players.size');
    return req.reduce((p, n) => p + n, 0);
};
const getPlaylists = async (client) => {
    const req = await client.shard.fetchClientValues('playlist.size');
    return req.reduce((p, n) => p + n, 0);
};
  
  
const getServerCount = async (client) => {
    const req = await client.shard.fetchClientValues('guilds.cache.size');
    return req.reduce((p, n) => p + n, 0);
};

const getMemberCount = async (client) => {
    const req = await client.shard.broadcastEval('this.guilds.cache.map((guild) => guild.memberCount)');
    return req[0].reduce((p, n) => p + n, 0);
};

const formatMemoryUsage = (data) => `${Math.round(data / 1024 / 1024 * 100) / 100} MB`;
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
                return message.send_("Sorry you can not send this command.");
            }

            var usg = (await pidusage(process.pid));

            var txt = "";

            txt += `Voice connections: ${await getVoiceConnectionsCount(client)}\n`;
            txt += `Players: ${await getPlayers(client)}\n`;
            txt += `Playlists: ${await getPlaylists(client)}\n`;
            txt+= `Server count: ${await getServerCount(client)}\n`;
            txt+= `Process memory ${formatMemoryUsage(usg.memory)}\n`;
            txt+= `CPU usage: ${usg.cpu.toFixed(2)}%`;

            return message.send_(txt);
        });
    },
    get command() {
        return {
            name: "getstatus",
            aliases: []
        };
    },
};