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

const podcastDatabase = require("./../../../database/PodcastDB")
const podcastDB = new podcastDatabase();

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
                
                return resolve(message.send_(new Discord.MessageEmbed()
                .setTitle(LOCALE.title)
                .setDescription(LOCALE["setup"].description.interpolate({
                    prefix: process.env.COMMAND_PREFIX
                }))))
            }
            if(!message.member.permissions.has("ADMINISTRATOR")){
                return resolve(message.send_(new Discord.MessageEmbed()
                .setTitle(LOCALE.title)
                .setDescription(LOCALE["errors"].no_permission.interpolate({
                    user: message.author
                }))))
            }
            if(action=="remove"){

                var channelPodcasts = await podcastDB.getAllPodcastsByChannel(message.channel.id);
                if(channelPodcasts.length <= 0){
                    return message.reply({
                        content: LOCALE["noPodcasts"]
                    })
                }
                for (let index = 0; index < channelPodcasts.length; index++) {
                    const element = channelPodcasts[index];
                    let podcastName = (await PodcastNotify.getPodcastInfo(element.feedUrl)).title
                    channelPodcasts[index].podcastName = podcastName
                }

                const row = new Discord.MessageActionRow()
                .addComponents(
                    new Discord.MessageSelectMenu()
                        .setCustomId('removepodcast')
                        .setPlaceholder(LOCALE["yourpodcasts"])
                        .addOptions(
                            channelPodcasts.slice(0,10).map((elm)=>{
                                return {
                                    label: elm.podcastName,
                                    value: `${elm.feedUrl}=/=${elm.podcastName}`,
                                }
                            })),
                );
                
                return resolve(
                    message.reply({
                        content: LOCALE["remove"],
                        components: [row]
                    })
                )
            }

            const url_ = url.parse(userMsg).host
            let podcastName = ""
            let podcastImage = ""
            if (userMsg.includes("open.spotify.com/show/") && url_.includes("open.spotify.com")) {
                var podcastShow;
                var podcast;

                try {
                    podcastShow = await Music.getSpotifyPodcastShow(userMsg)
                    podcast = await PodcastUtil.getPodcastsByTerm(podcastShow["name"])
                } catch (error) {
                    return message.send_(new Discord.MessageEmbed().setDescription(
                        LOCALE["errors"]["podcast_not_found"]
                    ))
                }
                try {
                    podcastName = podcastShow["name"]
                    podcastImage = podcastShow["images"][0]["url"]
                    
                    podcast = podcast.find(ep => {
                        return ep.kind == "podcast" && ep.artistName == podcastShow["publisher"] && ep.trackName == podcastShow["name"]
                    })

                    if (!podcast) {
                        return message.send_(new Discord.MessageEmbed().setDescription(
                            LOCALE["errors"]["podcast_not_found"]
                        ))
                    }
                    await PodcastNotify.addFeedUrl(podcast['feedUrl'], message.channel.id)
                } catch (error) {
                    return reject(error)
                }
            }

            return resolve(message.send_(new Discord.MessageEmbed()
                .setTitle(LOCALE.title)
                .setThumbnail(podcastImage)
                .setDescription(LOCALE["channel_added"].interpolate({
                    channel_name: message.channel.name,
                    podcast_name: podcastName
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