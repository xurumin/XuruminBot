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
    run: async (client, message, args) => {
        var player = client.players.get(message.guild.id);
        if (!player) {
            return message.send_(Utils.createSimpleEmbed("❌ O bot não está tocando nada no momento:", `➡️ Tente usar  **${process.env.COMMAND_PREFIX}play <link do youtube>** para tocar alguma coisa! 🤗`));
        }
        var music_playlist = `Suas próximas músicas de um total de **${player.getPlaylist().length}**\n\n`;
        
        player.getPlaylist().slice(0,5).forEach(element => {
            music_playlist += `➡️ **${element["name"]}** - ${element["author"]} - ⌛️ ${element["duration"]} \n`;
        });
        return message.send_(Utils.createSimpleEmbed("📻 Your playlist:", music_playlist));
    },

    get command() {
        return {
            name: 'queue'
        };
    },
};