"use strict";

const {
    createCanvas,
    loadImage
} = require('canvas')
const Discord = require('discord.js');
const path = require("path")
const Utils = require("./../../../utils/utils")

require('dotenv/config');

module.exports = {
    /**
     * @param  {Discord.Client} client
     * @param  {Discord.Message} message
     */
    validate(client, message) {
        return true;
    },
    /**
     * @param  {Discord.Client} client
     * @param  {Discord.Message} message
     * @param  {} args
     */
    run: (client, message, args, LOCALE) => {
        return new Promise(async (resolve, reject) => {
            message.channel.startTyping()
            setTimeout(() => {
                message.channel.stopTyping();
            }, 5000);

            const action = args[0]

            var avaliableActions = [
                "set",
                "remove"
            ]

            if(!action || !avaliableActions.includes(action)){
                message.channel.stopTyping()
                return resolve(message.channel.send(new Discord.MessageEmbed()
                .setTitle(LOCALE.title)
                .setDescription(LOCALE["setup"].description.interpolate({
                    prefix: process.env.COMMAND_PREFIX
                }))))
            }
            if(!message.guild.members.cache.find((user)=>user.id==message.author.id).hasPermission('ADMINISTRATOR')){
                return resolve(message.channel.send(new Discord.MessageEmbed()
                .setTitle(LOCALE.title)
                .setDescription(LOCALE["errors"].no_permission.interpolate({
                    user: message.author
                }))))
            }
            if(action=="remove"){
                await Utils.GameOffers.removeChannel(message.channel.id)
                return resolve(message.channel.send(new Discord.MessageEmbed()
                .setTitle(LOCALE.title)
                .setDescription(LOCALE["channel_removed"].interpolate({
                    channel_name: message.channel.name
                }))))
            }
            await Utils.GameOffers.setChannel(message.channel.id)
            return resolve(message.channel.send(new Discord.MessageEmbed()
                .setTitle(LOCALE.title)
                .setDescription(LOCALE["channel_added"].interpolate({
                    channel_name: message.channel.name
                }))))
        })
    },
    get command() {
        return {
            name: 'gameoffers',
            aliases:[
                "ofertajogo"
            ]
        }
    },
};