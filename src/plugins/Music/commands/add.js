const Discord = require('discord.js');
const Utils = require("./../../../utils/utils")
const Music = require("./../utils/Music")
const MusicPlayer = require("./../utils/MusicPlayer")
require('dotenv/config');
var url = require('url');


async function spotifyPlaylist(client, message, playlist_url, LOCALE) {
    var spotify_playlist;
    try {
        spotify_playlist = await Music.getSpotifyPlaylist(playlist_url, process.env.PLAYLIST_ADD_LIMIT ? process.env.PLAYLIST_ADD_LIMIT : 50)
    } catch (error) {
        return message.channel.send(Utils.createSimpleEmbed(LOCALE["errors"]["cmd_run_error"].title, LOCALE["errors"]["cmd_run_error"].description));
    }
    var player = client.players.get(message.guild.id)
    if (!player) {
        player = await new MusicPlayer(message.guild.id, client, message)
        await player.__connectVoice()
        client.players.set(message.guild.id, player)
        player.setPlaylist(spotify_playlist)
        player.play()
        return message.channel.send(Utils.createSimpleEmbed(LOCALE["playing"].interpolate({
            music_name: spotify_playlist[0].name,
            music_duration:spotify_playlist[0].duration
        })));
    } else {
        player.appendPlaylist(spotify_playlist)
        return message.channel.send(Utils.createSimpleEmbed(LOCALE["musics_added"].title, LOCALE["musics_added"].description.interpolate({
            prefix: process.env.COMMAND_PREFIX
        })));
    }
}
async function youtubePlaylist(client, message, playlist_url, LOCALE) {
    let youtube_playlist;
    try {
        youtube_playlist = await Music.getYoutubePlaylistByUrl(playlist_url, 50)
    } catch (error) {
        console.log({
            type: "Erro ao carregar a playlist",
            info: error
        })
        return message.channel.send(Utils.createSimpleEmbed(LOCALE["errors"]["cmd_run_error"].title, LOCALE["errors"]["cmd_run_error"].description));
    }
    var player = client.players.get(message.guild.id)
    if (!player) {
        player = await new MusicPlayer(message.guild.id, client, message)
        await player.__connectVoice()
        client.players.set(message.guild.id, player)
        player.setPlaylist(youtube_playlist)
        player.play()
        return message.channel.send(Utils.createSimpleEmbed(LOCALE["playing"].interpolate({
            music_name: youtube_playlist[0].name,
            music_duration: youtube_playlist[0].duration
        })));
    } else {
        player.appendPlaylist(youtube_playlist)
        return message.channel.send(Utils.createSimpleEmbed(LOCALE["musics_added"].title, LOCALE["musics_added"].description.interpolate({
            prefix: process.env.COMMAND_PREFIX
        })));
    }
}
async function youtubeLink(client, message,  video_url, LOCALE) {
    try {
        var video_info = await Music.getVideoInfoByUrl(video_url)
    } catch (error) {
        return message.channel.send(Utils.createSimpleEmbed(LOCALE["errors"]["cmd_run_error"].title, LOCALE["errors"]["cmd_run_error"].description));
    }
    var player = client.players.get(message.guild.id)
    if (!player) {
        player = await new MusicPlayer(message.guild.id, client, message)
        await player.__connectVoice()
        client.players.set(message.guild.id, player)
        player.setPlaylist([video_info])
        player.play()
        return message.channel.send(Utils.createSimpleEmbed(LOCALE["playing"].interpolate({
            music_name: video_info.name,
            music_duration: video_info.duration
        })));
    } else {
        player.appendPlaylist([video_info])
        return message.channel.send(Utils.createSimpleEmbed(LOCALE["musics_added"].title, LOCALE["musics_added"].description.interpolate({
            prefix: process.env.COMMAND_PREFIX
        })));
    }
}

function searchTerm(client, message, args, LOCALE) {
    let search_term = args.join(" ")

    Music.searchYoutubeVideos(search_term, 5)
        .then(async (res) => {
            var searchlist = []
           // var txt = LOCALE["youtube_search"].title
           var txt = new Discord.MessageEmbed().setTitle(LOCALE["youtube_search"].title)
            var searchlist = res.map((element, i) => {
                var title = element["title"]
                var author = element["author"] ? element["author"]["name"] : "Youtube"
                // txt += LOCALE["youtube_search"].txt_format.interpolate({
                //     index: i+1,
                //     title: title,
                //     author: author
                // })
                txt.addField("\u200b", LOCALE["youtube_search"].txt_format.interpolate({
                        index: i+1,
                        title: title,
                        author: author
                    }))
                return element
            })
            //txt +=  LOCALE["youtube_search"].footer
            txt.setFooter(LOCALE["youtube_search"].footer)

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
                return message.channel.send(Utils.createSimpleEmbed(LOCALE["playing"].interpolate({
                    music_name: video_info.name,
                    music_duration: video_info.duration
                })));
            } else {
                player.appendPlaylist([video_info])
                return message.channel.send(Utils.createSimpleEmbed(LOCALE["musics_added"].title, LOCALE["musics_added"].description.interpolate({
                    prefix: process.env.COMMAND_PREFIX
                })));
            }

        })
        .catch(err => {
            console.log(err);
            return message.channel.send(Utils.createSimpleEmbed(LOCALE["errors"]["cmd_run_error"].title, LOCALE["errors"]["cmd_run_error"].description));
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
    run: async (client, message, args, LOCALE) => {
        const userMsg = args[0] || ""
        const url_ = url.parse(userMsg).host

        if (!message.member.voice.channel) {
            return message.channel.send(
                Utils.createSimpleEmbed(LOCALE["errors"].ops_title, LOCALE["errors"].user_is_not_on_voice_chat)
            );
        }

        if (args.length <= 0 || !args) {
            return message.channel.send(
                Utils.createSimpleEmbed(LOCALE["errors"]["wrong_format"].title, LOCALE["errors"]["wrong_format"].description.interpolate({
                    prefix: process.env.COMMAND_PREFIX
                }))
            );
        }

        if (userMsg.includes("open.spotify.com/playlist/") && url_.includes("open.spotify.com")) {
            return spotifyPlaylist(client, message, userMsg, LOCALE)
        }
        if (userMsg.includes("youtube.com/playlist") && url_.includes("youtube.com")) {
            return youtubePlaylist(client, message, userMsg, LOCALE)
        }
        if (!url_) {
            return searchTerm(client, message, args, LOCALE)
        }
        if (userMsg.includes("youtube.com/watch") && url_.includes("youtube.com")) {
            return youtubeLink(client, message, userMsg, LOCALE)
        }
        if (userMsg.includes("open.spotify.com/track/")) {
            return message.channel.send(
                Utils.createSimpleEmbed("Ops! Ainda não consigo tocar tracks do Spotify 😞", `➡️ Tenta tocar uma playlist com **${process.env.COMMAND_PREFIX}add <link da playlist>** ou tocar um vídeo do Youtube com **${process.env.COMMAND_PREFIX}add <link do youtube>** 🤗`, client.user.username, client.user.avatarURL())
            );
        }

        return message.channel.send(LOCALE["errors"].not_found)

    },
    get command() {
        return {
            name: 'add',
            aliases: ["youtube", "spotify", "play"]
        }
    },
};