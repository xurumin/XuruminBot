const Discord = require('discord.js');
const Utils = require("./../../../utils/utils")
const Music = require("./../utils/Music")
const MusicPlayer = require("./../utils/MusicPlayer")
const PodcastUtil = require('./../../../plugins/Podcast/utils/PodcastUtil');
require('dotenv/config');
var url = require('url');

const config = require("./../../../config");

const twitch = require("twitch-m3u8");

/**
 * playlist format
 * {
    name:
    url:
    author:
    duration:
    }
*/
async function playMp3(client, message, track_url, LOCALE) {
    var player = client.players.get(message.guild.id)
    if (!player) {
        player = await new MusicPlayer(message.guild.id, client, message, "mp3")
        player.setAudioQuality(message.audioquality)
        await player.__connectVoice()
        client.players.set(message.guild.id, player)
        player.setPlaylist([{
            name: "TWITCH",
            url: track_url,
            author: "TWITCH",
            duration: Infinity
        }])
        player.playMp3()
        return message.channel.send(Utils.createSimpleEmbed(LOCALE.title, LOCALE["stream_added"]));
    } else {
        player.appendPlaylist([{
            name: "TWITCH",
            url: track_url,
            author: "TWITCH",
            duration: Infinity
        }])
        return message.channel.send(Utils.createSimpleEmbed(LOCALE.title, LOCALE["stream_added"]));
    }
}

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
        const url_ = url.parse(args.join(""))

        if(!url_.host){
            var twitch_user = args.join("")

        }else{
            if(!args.join("") || (url_.host != "twitch.tv" && url_.host != "www.twitch.tv")){
                return message.channel.send(Utils.createSimpleEmbed(LOCALE["errors"]["not_found"]));
            }
            var twitch_user = url_.path.split("/")[1]
        }
        
        twitch.getStream(twitch_user)
        .then(data => {
            var audio = data.find(elm=> elm.quality="audio_only")["url"]
            return playMp3(client, message, audio, LOCALE);
        })
        .catch((err)=>{
            return message.channel.send(Utils.createSimpleEmbed(LOCALE["errors"]["not_found"]));
        })

    },
    get command() {
        return {
            name: 'twitch'
        }
    },
};