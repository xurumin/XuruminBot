const Discord = require('discord.js');
const Utils = require("./../../../utils/utils")
const Music = require("./../utils/Music")
const MusicPlayer = require("./../utils/MusicPlayer")
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
        var player = client.players.get(message.guild.id)
        if (!player) {
            return message.channel.send(LOCALE.errors.not_playing)
        }
        var pb = ["▬","▬","▬","▬","▬","▬","▬","▬","▬","▬","▬","▬","▬","▬","▬","▬","▬","▬","▬","▬","▬"]
        const current_time = player.getPlayingTime() / 1000
        const current_music = player.getPlaylist()[0]
        const duration = current_music["duration"]
        var current_pb = Math.round((current_time * 20) / Utils.hmsToSeconds(duration))
        if(current_pb > 20) current_pb = 20
        
        pb[current_pb] = "🔘"

        return message.channel.send(new Discord.MessageEmbed().setDescription(
            LOCALE.message.interpolate({
                title: current_music["name"],
                author: current_music["author"],
                time: `\`${Utils.toHHMMSS(current_time)} / ${duration}\``,
                progress_bar: `\`⏯️ ${Utils.toHHMMSS(current_time)} ${pb.join("")} ${duration}\` `
            })
        ));
    },

    get command() {
        return {
            name: 'now',
            aliases: [
                "tocando",
                "nowplaying"
            ]
        }
    },
};