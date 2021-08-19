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
            return message.send_(LOCALE.errors.not_playing.interpolate({
                prefix: process.env.COMMAND_PREFIX
            }))
        }
        const tm = args[0]

        if(!args[0]){
            return message.send_(LOCALE.errors.cmd_run_error.interpolate({
                prefix: process.env.COMMAND_PREFIX
            }))
        }
        let convertedTm;
        convertedTm = Utils.globalTimeToMS(tm)/1000
        if(!convertedTm){
            return message.send_(LOCALE.errors.cmd_run_error.interpolate({
                prefix: process.env.COMMAND_PREFIX
            }))
        }
        player.changeTime(convertedTm)
        return message.send_(LOCALE.message.interpolate({
            time: Utils.toHHMMSS(convertedTm)
        }));
    },

    get command() {
        return {
            name: 'timetravel',
            aliases: [
                "tt",
                "changetime",
                "mudartempo",
                "tempo",
                "musictime"
            ]
        }
    },
};