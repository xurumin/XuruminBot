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
            return message.channel.send(LOCALE.errors.not_playing.interpolate({
                prefix: process.env.COMMAND_PREFIX
            }))
        }
        const tm = args[0]

        if(!args[0]){
            return message.channel.send(LOCALE.errors.cmd_run_error.interpolate({
                prefix: process.env.COMMAND_PREFIX
            }))
        }
        let convertedTm;
        convertedTm = Utils.globalTimeToMS(tm)/1000
        if(!convertedTm){
            return message.channel.send(LOCALE.errors.cmd_run_error.interpolate({
                prefix: process.env.COMMAND_PREFIX
            }))
        }

        const newTime = convertedTm + (player.getPlayingTime() / 1000)

        player.changeTime(newTime)
        return message.channel.send(LOCALE.message.interpolate({
            time: Utils.toHHMMSS(newTime)
        }));
    },

    get command() {
        return {
            name: 'forward',
            aliases: [
                "avancar",
                "fwd"
            ]
        }
    },
};