const Discord = require('discord.js');
const Utils = require("../../../utils/utils")
const Music = require("../utils/Music")
const MusicPlayer = require("../utils/MusicPlayer")
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
        return new Promise(async (resolve, reject) => {


            let current_playing_song = args.join(" ")
            let lyric;

            if (current_playing_song.length <= 0) {
                if (!message.member.voice.channel) {
                    return resolve(message.channel.send(
                        Utils.createSimpleEmbed("❌ Erro ao executar comando:", `➡️ Você precisa estar em um chat de voz para executar o comando 😉`)
                    ));
                }
                if (!player) {
                    return resolve(message.channel.send(
                        Utils.createSimpleEmbed("❌ Erro ao executar comando:", `➡️ Você precisa estar tocando alguma coisa para executar o comando 😉`)
                    ));
                }

                var player = client.players.get(message.guild.id)
                current_playing_song = player.getPlaylist()[0]
                current_playing_song = current_playing_song["name"] + " " + current_playing_song["author"]
            }

            message.channel.startTyping()
            setTimeout(()=>{
                message.channel.stopTyping()
            }, 4000)

            try {
                lyric = await Music.getLyricByMusicName(current_playing_song)
            } catch (error) {
                console.log(error);
                const embed = new Discord.MessageEmbed()
                    .setColor('#9d65c9')
                    .setTitle(`Letra da música não encontrada :(`)
                    .setAuthor(client.user.username)
                
                message.channel.stopTyping()
                return resolve(message.channel.send(embed));
            }

            if (!lyric || lyric == undefined) {
                const embed = new Discord.MessageEmbed()
                    .setColor('#9d65c9')
                    .setTitle(`Letra da música não encontrada :(`)
                    .setAuthor(client.user.username)
                
                message.channel.stopTyping()
                return resolve(message.channel.send(embed));
            }

            if (lyric.length < 3000 && lyric.length > 1999) {
                let txt = lyric.slice(0, 1500)
                const embed = new Discord.MessageEmbed()
                    .setColor('#9d65c9')
                    .setTitle(`Music Lyrics for ${current_playing_song}`)
                    .setAuthor(client.user.username)
                    .setDescription(txt)
                await message.channel.send(embed);

                const embed2 = new Discord.MessageEmbed()
                    .setColor('#9d65c9')
                    .setDescription(lyric.slice(1500, lyric.length))

                message.channel.stopTyping()
                return resolve(message.channel.send(embed2));
            } else {
                const embed = new Discord.MessageEmbed()
                    .setColor('#9d65c9')
                    .setTitle(`Music Lyrics for ${current_playing_song}`)
                    .setAuthor(client.user.username)
                    .setDescription(lyric)
                message.channel.stopTyping()
                return resolve(message.channel.send(embed));
            }
        })

    },
    get command() {
        return {
            name: 'lyrics',
            aliases: ["letras"]
        }
    },
};