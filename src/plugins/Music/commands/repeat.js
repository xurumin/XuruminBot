const Discord = require('discord.js');
const Utils = require("./../../../utils/utils");
const Music = require("./../utils/Music");
const MusicPlayer = require("./../utils/MusicPlayer");
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
        var player = client.players.get(message.guild.id);
        if (!player) {
            return message.send_(LOCALE.errors.not_playing.interpolate({
                prefix: process.env.COMMAND_PREFIX
            }));
        }

        player.unshiftPlaylist([player.getPlaylist()[0]]);

        return await message.send_(Utils.createSimpleEmbed(LOCALE.playlist_changed.title, LOCALE.playlist_changed.description.interpolate({
            prefix: process.env.COMMAND_PREFIX
        })));
    },

    get command() {
        return {
            name: 'repeat',
            aliases: [
                "repetir",
                "rpt"
            ]
        };
    },
};