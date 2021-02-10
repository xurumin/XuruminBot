const Discord = require('discord.js');
const utils = require('./../../../utils/utils');
const Utils = require("./../../../utils/utils")
const Music = require("./../utils/Music")
const MusicPlayer = require("./../utils/MusicPlayer")
require('dotenv/config');



async function spotifyPlaylist(client, message, args) {
    const playlist_url = args[0]
    if (args.length != 1 || !playlist_url) {
        return message.channel.send(
            Utils.createSimpleEmbed("❌ Erro ao digitar comando:", `➡️ Use  **${process.env.COMMAND_PREFIX}spotify <link da playlist>** para tocar alguma playlist! 🤗`, client.user.username, client.user.avatarURL())
        );
    }
    if (!message.member.voice.channel) {
        return message.channel.send(
            Utils.createSimpleEmbed("❌ Erro ao executar comando:", `➡️ Você precisa estar em um chat de voz para executar o comando 😉`, client.user.username, client.user.avatarURL())
        );
    }
    var spotify_playlist;
    try {
        spotify_playlist = await Music.getSpotifyPlaylist(playlist_url, 50)
    } catch (error) {
        console.log(">", error)
        return message.channel.send(Utils.createSimpleEmbed("❌ Erro ao executar comando:", `O serviço está temporariamente indisponível 😞\nNossos gatinhos programadores estão fazendo o possível para resolver isso 🤗`, client.user.username, client.user.avatarURL()));
    }
    var player = client.players.get(message.guild.id)
    if (!player) {
        player = await new MusicPlayer(message.guild.id, client, message)
        await player.__connectVoice()
        client.players.set(message.guild.id, player)
        player.setPlaylist(spotify_playlist)
        player.play()
        return message.channel.send(Utils.createSimpleEmbed(`🔊 Tocando ${spotify_playlist[0].name} - ⌛️ ${spotify_playlist[0].duration}`));
    } else {
        player.appendPlaylist(spotify_playlist)
        return message.channel.send(Utils.createSimpleEmbed("✅ Suas músicas foram adicionada à playlist", `Utilize **${process.env.COMMAND_PREFIX}queue** para ver sua nova playlist! 😉`, client.user.username, client.user.avatarURL()));
    }
}
async function youtubePlaylist(client, message, args) {
    const playlist_url = args[0]
    if (args.length != 1 || !playlist_url) {
        return message.channel.send(
            Utils.createSimpleEmbed("❌ Erro ao digitar comando:", `➡️ Use  **${process.env.COMMAND_PREFIX}youtube <link da playlist>** para tocar alguma playlist! 🤗`, client.user.username, client.user.avatarURL())
        );
    }
    if (!message.member.voice.channel) {
        return message.channel.send(
            Utils.createSimpleEmbed("❌ Erro ao executar comando:", `➡️ Você precisa estar em um chat de voz para executar o comando 😉`, client.user.username, client.user.avatarURL())
        );
    }
    let youtube_playlist;
    try {
        youtube_playlist = await Music.getYoutubePlaylistByUrl(playlist_url, 50)
    } catch (error) {
        console.log({
            type: "Erro ao carregar a playlist",
            info: error
        })
        return message.channel.send(Utils.createSimpleEmbed("❌ Erro ao executar comando:", `O serviço está temporariamente indisponível 😞\nNossos gatinhos programadores estão fazendo o possível para resolver isso 🤗`, client.user.username, client.user.avatarURL()));
    }
    var player = client.players.get(message.guild.id)
    if (!player) {
        player = await new MusicPlayer(message.guild.id, client, message)
        await player.__connectVoice()
        client.players.set(message.guild.id, player)
        player.setPlaylist(youtube_playlist)
        player.play()
        return message.channel.send(Utils.createSimpleEmbed(`🔊 Tocando ${youtube_playlist[0].name} - ⌛️ ${youtube_playlist[0].duration}`));
    } else {
        player.appendPlaylist(youtube_playlist)
        return message.channel.send(Utils.createSimpleEmbed("✅ Suas músicas foram adicionadas à playlist", `Utilize **${process.env.COMMAND_PREFIX}queue** para ver sua nova playlist! 😉`, client.user.username, client.user.avatarURL()));
    }
}
async function youtubeLink(client, message, args) {
    const video_url = args[0]
    try {
        var video_info = await Music.getVideoInfoByUrl(video_url)
    } catch (error) {
        console.log(">", error)
        return message.channel.send(Utils.createSimpleEmbed("❌ Erro ao executar comando:", `O serviço está temporariamente indisponível 😞\nNossos gatinhos programadores estão fazendo o possível para resolver isso 🤗`, client.user.username, client.user.avatarURL()));
    }
    var player = client.players.get(message.guild.id)
    if (!player) {
        player = await new MusicPlayer(message.guild.id, client, message)
        await player.__connectVoice()
        client.players.set(message.guild.id, player)
        player.setPlaylist([video_info])
        player.play()
        return message.channel.send(Utils.createSimpleEmbed(`🔊 Tocando ${video_info.name} - ⌛️ ${video_info.duration}`));
    } else {
        player.appendPlaylist([video_info])
        return message.channel.send(Utils.createSimpleEmbed("✅ Sua música foi adicionada à playlist", `Utilize **${process.env.COMMAND_PREFIX}queue** para ver sua nova playlist! 😉`, client.user.username, client.user.avatarURL()));
    }
}

function searchTerm(client, message, args) {
    let search_term = args.join(" ")

    Music.searchYoutubeVideos(search_term, 5)
        .then(async (res) => {
            var searchlist = []
            var txt = "👨‍💻 Sua pesquisa retornou: \n\n"
            var searchlist = res.map((element, i) => {
                var title = element["title"] ? element["title"] : element["title"]
                var author = element["author"] ? element["author"]["name"] : "null"
                txt += `➡️${i+1}: **${title}** de **${author}**\n\n`
                return element
            })
            txt += "🔔 Clique no número abaixo para adicionar à playlist\n\n"

            var msg = await message.channel.send(txt)

            var reactIndex = await Music.getReact(msg, message.author)

            const video_info = {
                name: searchlist[reactIndex]["title"],
                author: searchlist[reactIndex]["author"],
                duration: searchlist[reactIndex]["duration"]
            }

            var player = client.players.get(message.guild.id)
            if (!player) {
                player = await new MusicPlayer(message.guild.id, client, message)
                await player.__connectVoice()
                client.players.set(message.guild.id, player)
                player.setPlaylist([video_info])
                player.play()
                return message.channel.send(Utils.createSimpleEmbed(`🔊 Tocando ${video_info.name} - ⌛️ ${video_info.duration}`));
            } else {
                player.appendPlaylist([video_info])
                return message.channel.send(Utils.createSimpleEmbed("✅ Sua música foi adicionada à playlist", `Utilize **${process.env.COMMAND_PREFIX}queue** para ver sua nova playlist! 😉`, client.user.username, client.user.avatarURL()));
            }

        })
        .catch(err => {
            return err
        })
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
    run: async (client, message, args) => {
        const userMsg = args[0]

        if (!message.member.voice.channel) {
            return message.channel.send(
                Utils.createSimpleEmbed("❌ Erro ao executar comando:", `➡️ Você precisa estar em um chat de voz para executar o comando 😉`, client.user.username, client.user.avatarURL())
            );
        }

        if (args.length <= 0 || !args) {
            return message.channel.send(
                Utils.createSimpleEmbed("Ops! Você digitou o comendo errado!", `➡️ Tente usar **${process.env.COMMAND_PREFIX}help** para saber como usar os comandos ou tenta tocar uma playlist do Spotify com **${process.env.COMMAND_PREFIX}spotify <link da playlist>** 🤗`, client.user.username, client.user.avatarURL())
            );
        }

        if (userMsg.includes("open.spotify.com/playlist/")) {
            return spotifyPlaylist(client, message, args)
        }
        if (userMsg.includes("youtube.com/playlist")) {
            return youtubePlaylist(client, message, args)
        }
        if ((!userMsg.startsWith("https://") || !userMsg.startsWith("http://")) && !userMsg.includes(".com")) {
            return searchTerm(client, message, args)
        }
        if (userMsg.includes("youtube.com/watch")) {
            return youtubeLink(client, message, args)
        }
        if (userMsg.includes("open.spotify.com/track/")) {
            return message.channel.send(
                Utils.createSimpleEmbed("Ops! Ainda não consigo tocar tracks do Spotify 😞", `➡️ Tenta tocar uma playlist com **${process.env.COMMAND_PREFIX}spotify <link da playlist>** ou tocar um vídeo do Youtube com **${process.env.COMMAND_PREFIX}play <link do youtube>** 🤗`, client.user.username, client.user.avatarURL())
            );
        }

        return message.channel.send(
            Utils.createSimpleEmbed("Ops! Você digitou o comendo errado! (ou eu ainda não implementei o que você busca 😞)", `➡️ Tente usar **${process.env.COMMAND_PREFIX}help** para saber como usar os comandos ou tenta tocar uma playlist do Spotify com **${process.env.COMMAND_PREFIX}spotify <link da playlist>** 🤗`, client.user.username, client.user.avatarURL())
        );

    },
    get command() {
        return {
            name: 'add'
        }
    },
};