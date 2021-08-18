"use strict";

const {
    createCanvas,
    loadImage
} = require('canvas')
const Discord = require('discord.js');
const path = require("path")
const Utils = require("./../../../utils/utils")
const PodcastNotify = require("../../../plugins/Notify/utils/PodcastNotification")
const PodcastUtil = require('./../../../plugins/Podcast/utils/PodcastUtil');
const Music = require("./../../../plugins/Music/utils/Music")
var url = require('url');

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
            const userMsg = args[1] || ""

            message.channel.sendTyping();
            

            const action = args[0]

            var avaliableActions = [
                "set",
                "remove"
            ]

            if(!action || !avaliableActions.includes(action)){
                
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
                await Utils.PodcastNotify.removeChannel(message.channel.id)
                return resolve(message.channel.send(new Discord.MessageEmbed()
                .setTitle(LOCALE.title)
                .setDescription(LOCALE["channel_removed"].interpolate({
                    channel_name: message.channel.name
                }))))
            }

            const url_ = url.parse(userMsg).host
            if (userMsg.includes("open.spotify.com/show/") && url_.includes("open.spotify.com")) {
                var podcastShow;
                var podcast;

                try {
                    podcastShow = await Music.getSpotifyPodcastShow(userMsg)
                    podcast = await PodcastUtil.getPodcastsByTerm(podcastShow["name"])
                } catch (error) {
                    return message.channel.send(new Discord.MessageEmbed().setDescription(
                        LOCALE["errors"]["podcast_not_found"]
                    ))
                }
                try {
                    podcast = podcast.find(ep => {
                        return ep.kind == "podcast" && ep.artistName == podcastShow["publisher"] && ep.trackName == podcastShow["name"]
                    })

                    if (!podcast) {
                        return message.channel.send(new Discord.MessageEmbed().setDescription(
                            LOCALE["errors"]["podcast_not_found"]
                        ))
                    }
                    await PodcastNotify.addFeedUrl(podcast['feedUrl'], message.channel.id)
                } catch (error) {
                    return reject(error)
                }
            }

            return resolve(message.channel.send(new Discord.MessageEmbed()
                .setTitle(LOCALE.title)
                .setDescription(LOCALE["channel_added"].interpolate({
                    channel_name: message.channel.name
            }))))
        })
    },
    get command() {
        return {
            name: 'podcastnotify',
            aliases:[
                "pdcntf",
                "notificarpodcast"
            ]
        }
    },
};