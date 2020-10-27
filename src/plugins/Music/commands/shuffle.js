const Discord = require('discord.js');
const Utils = require("./../../../utils/utils")
const Music = require("./../utils/Music")
const MusicPlayer = require("./../utils/MusicPlayer")
require('dotenv/config');

module.exports = {
    validate(client, message) {
        if (!message.member.hasPermission('MANAGE_GUILD')) {
            throw new Error('no_permission');
        }
    },
    /**
     * @param  {Discord.Client} client
     * @param  {Discord.Message} message
     * @param  {} args
     */
    run: async (client, message, args) => {

        

        if (!message.member.voice.channel) {
            return message.channel.send(
                Utils.createSimpleEmbed("❌ Erro ao executar comando:", `➡️ Você precisa estar em um chat de voz para executar o comando 😉`, client.user.username, client.user.avatarURL())
            );
        }


        var player = client.players.get(message.guild.id)
        if (!player) {
            player = await new MusicPlayer(message.guild.id, client, message)
            if(!player.getPlaylist()){
                return message.channel.send(
                    Utils.createSimpleEmbed("❌ Erro ao executar comando:", `➡️ Você precisa estar tocando alguma coisa para executar o comando 😉`, client.user.username, client.user.avatarURL())
                );
            }
            player.shufflePlaylist()
            return message.channel.send(Utils.createSimpleEmbed("✅ Playlist randomizada!", `Utilize **${process.env.COMMAND_PREFIX}queue** para ver sua nova playlist! 😉`, client.user.username, client.user.avatarURL()));
        }else{
            if(!player.getPlaylist()){
                return message.channel.send(
                    Utils.createSimpleEmbed("❌ Erro ao executar comando:", `➡️ Você precisa estar tocando alguma coisa para executar o comando 😉`, client.user.username, client.user.avatarURL())
                );
            }
            player.shufflePlaylist()
            return message.channel.send(Utils.createSimpleEmbed("✅ Playlist randomizada!", `Utilize **${process.env.COMMAND_PREFIX}queue** para ver sua nova playlist! 😉`, client.user.username, client.user.avatarURL()));
        }

    },

    get command() {
        return {
            name: 'shuffle',
            description: 'Randomiza a playlist',
            usage: 'shuffle'
        }
    },
};