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
        return message.channel.send(LOCALE.message.interpolate({
            time: Utils.toHHMMSS(player.getPlayingTime() / 1000)
        }));
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