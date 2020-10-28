const Discord = require('discord.js');
const Utils = require("../../../utils/utils")
const Music = require("../utils/Music")
const MusicPlayer = require("../utils/MusicPlayer")
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
        let player = client.players.get(message.guild.id)
        if (!player) {
            return message.channel.send(
                Utils.createSimpleEmbed("❌ Erro ao executar comando:", `➡️ Você precisa estar tocando alguma coisa para executar o comando 😉`, client.user.username, client.user.avatarURL())
            );
        }
        let current_playing_song = player.getPlaylist()[0]

        let lyric = await Music.getLyricByMusicName(current_playing_song["name"] + current_playing_song["author"])

        if(lyric.length < 3000 && lyric.length > 1999){
            let txt = lyric.slice(0, 1500)
            const embed = new Discord.MessageEmbed()
            .setColor('#9d65c9')
            .setTitle(`${current_playing_song.name} - ${current_playing_song.author} | Music lyrics`)
            .setAuthor(client.user.username)
            .setDescription(txt)
            await message.channel.send(embed);

            const embed2 = new Discord.MessageEmbed()
            .setColor('#9d65c9')
            .setDescription(lyric.slice(1500, lyric.length))

            return await message.channel.send(embed2);
        }else{
            const embed = new Discord.MessageEmbed()
            .setColor('#9d65c9')
            .setTitle(`${current_playing_song.name} - ${current_playing_song.author} | Music lyrics`)
            .setAuthor(client.user.username)
            .setDescription(lyric)

            return message.channel.send(embed);
        }
        
    },
    get command() {
        return {
            name: 'lyrics',
            aliases: ["letras"]
        }
    },
};