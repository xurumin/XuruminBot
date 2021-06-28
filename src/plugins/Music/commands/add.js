const Discord = require('discord.js');
const Utils = require("./../../../utils/utils")
const Music = require("./../utils/Music")
const MusicPlayer = require("./../utils/MusicPlayer")
const PodcastUtil = require('./../../../plugins/Podcast/utils/PodcastUtil');
require('dotenv/config');
var url = require('url');

const config = require("./../../../config");


/**
 * playlist format
 * {
    name:
    url:
    author:
    duration:
    }
*/

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
        player.setAudioQuality(message.audioquality)
        await player.__connectVoice()
        client.players.set(message.guild.id, player)
        player.setPlaylist(spotify_playlist)
        player.play()
        return message.channel.send(Utils.createSimpleEmbed(LOCALE["playing"].interpolate({
            music_name: spotify_playlist[0].name,
            music_duration: spotify_playlist[0].duration
        })));
    } else {
        player.appendPlaylist(spotify_playlist)
        return message.channel.send(Utils.createSimpleEmbed(LOCALE["musics_added"].title, LOCALE["musics_added"].description.interpolate({
            prefix: process.env.COMMAND_PREFIX
        })));
    }
}
async function spotifyTrack(client, message, track_url, LOCALE) {
    var spotifyTrack;
    try {
        spotifyTrack = await Music.getSpotifyTrack(track_url)
    } catch (error) {
        return message.channel.send(Utils.createSimpleEmbed(LOCALE["errors"]["cmd_run_error"].title, LOCALE["errors"]["cmd_run_error"].description));
    }
    var player = client.players.get(message.guild.id)
    if (!player) {
        player = await new MusicPlayer(message.guild.id, client, message)
        player.setAudioQuality(message.audioquality)
        await player.__connectVoice()
        client.players.set(message.guild.id, player)
        player.setPlaylist([spotifyTrack])
        player.play()
        return message.channel.send(Utils.createSimpleEmbed(LOCALE["playing"].interpolate({
            music_name: spotifyTrack.name,
            music_duration: spotifyTrack.duration
        })));
    } else {
        player.appendPlaylist([spotifyTrack])
        return message.channel.send(Utils.createSimpleEmbed(LOCALE["musics_added"].title, LOCALE["musics_added"].description.interpolate({
            prefix: process.env.COMMAND_PREFIX
        })));
    }
}
async function spotifyAlbum(client, message, album_url, LOCALE) {
    var spotifyAlbum;
    try {
        spotifyAlbum = await Music.getSpotifyAlbum(album_url)
    } catch (error) {
        return message.channel.send(Utils.createSimpleEmbed(LOCALE["errors"]["cmd_run_error"].title, LOCALE["errors"]["cmd_run_error"].description));
    }
    var player = client.players.get(message.guild.id)
    if (!player) {
        player = await new MusicPlayer(message.guild.id, client, message)
        player.setAudioQuality(message.audioquality)
        await player.__connectVoice()
        client.players.set(message.guild.id, player)
        player.setPlaylist(spotifyAlbum)
        player.play()
        return message.channel.send(Utils.createSimpleEmbed(LOCALE["playing"].interpolate({
            music_name: spotifyAlbum[0].name,
            music_duration: spotifyAlbum[0].duration
        })));
    } else {
        player.appendPlaylist(spotifyAlbum)
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
        player.setAudioQuality(message.audioquality)
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
async function youtubeLink(client, message, video_url, LOCALE) {
    try {
        var video_info = await Music.getVideoInfoByUrl(video_url)
    } catch (error) {
        var video_info = {
            name: "#",
            author: "Youtube",
            url: video_url,
            duration: "99:99"
        }
        // return message.channel.send(Utils.createSimpleEmbed(LOCALE["errors"]["cmd_run_error"].title, LOCALE["errors"]["cmd_run_error"].description));
    }
    var player = client.players.get(message.guild.id)
    if (!player) {
        player = await new MusicPlayer(message.guild.id, client, message)
        player.setAudioQuality(message.audioquality)
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
                txt.addField("\u200b", LOCALE["youtube_search"].txt_format.interpolate({
                    index: i + 1,
                    title: title,
                    author: author
                }))
                return element
            })
            //txt +=  LOCALE["youtube_search"].footer
            txt.setFooter(LOCALE["youtube_search"].footer)

            var msg = await message.channel.send(txt)

            var reactIndex = await Music.getReact(msg, message.author)

            if (reactIndex == -1) return;

            const video_info = {
                name: searchlist[reactIndex]["title"],
                author: searchlist[reactIndex]["author"],
                duration: searchlist[reactIndex]["duration"]
            }

            var player = client.players.get(message.guild.id)
            if (!player) {
                player = await new MusicPlayer(message.guild.id, client, message)
                player.setAudioQuality(message.audioquality)
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
async function podcastEpisode(client, message, track_url, LOCALE) {
    var podcastShow;
    var podcastEp;
    try {
        // podcastEp = await Music.getSpotifyPodcastEp(track_url)
        podcastEp = await Music.getSpotifyPodcastEp(track_url)
        podcastShow = await PodcastUtil.getPodcastsByTerm(podcastEp["show_name"])
        podcastShow = podcastShow.find(ep => {
            return ep.kind == "podcast" && ep.artistName == podcastEp["publisher"] && ep.trackName == podcastEp["show_name"]
        })

        if (!podcastShow) {
            return message.channel.send(new Discord.MessageEmbed().setDescription("Oops! Não achei nenhum podcast com esse nome.\nTente procurar o **nome** do podcast :)"))
        }

        var eps = await PodcastUtil.getLastEpsByUrl(podcastShow["feedUrl"], 0, 5000)
        var episodeF = eps.find(ep => {
            return (String(ep["title"][0]).toLowerCase() == String(podcastEp["name"]).toLowerCase()) || String(ep["itunes:title"]).toLowerCase() == String(podcastEp["name"]).toLowerCase()
        })
        if (!episodeF) {
            return message.channel.send(new Discord.MessageEmbed().setDescription("Oops! Não achei nenhum podcast com esse nome.\nTente procurar o **nome** do podcast :)"))
        }
        podcastEp.url = episodeF["enclosure"][0]["$"]["url"]


    } catch (error) {
        console.log(error);
        return message.channel.send(Utils.createSimpleEmbed(LOCALE["errors"]["cmd_run_error"].title, LOCALE["errors"]["cmd_run_error"].description));
    }
    var player = client.players.get(message.guild.id)
    if (!player) {
        player = await new MusicPlayer(message.guild.id, client, message, "mp3")
        player.setAudioQuality(message.audioquality)
        await player.__connectVoice()
        client.players.set(message.guild.id, player)
        player.setPlaylist([podcastEp])
        player.playMp3()
        return message.channel.send(Utils.createSimpleEmbed(LOCALE["playing"].interpolate({
            music_name: podcastEp.name,
            music_duration: podcastEp.duration
        })));
    } else {
        player.appendPlaylist([podcastEp])
        return message.channel.send(Utils.createSimpleEmbed(LOCALE["musics_added"].title, LOCALE["musics_added"].description.interpolate({
            prefix: process.env.COMMAND_PREFIX
        })));
    }
}
async function playMp3(client, message, track_url, LOCALE) {
    var player = client.players.get(message.guild.id)
    if (!player) {
        player = await new MusicPlayer(message.guild.id, client, message, "mp3")
        player.setAudioQuality(message.audioquality)
        await player.__connectVoice()
        client.players.set(message.guild.id, player)
        player.setPlaylist([{
            name: "MP3",
            url: track_url,
            author: "MP3",
            duration: Infinity
        }])
        player.playMp3()
        return message.channel.send(Utils.createSimpleEmbed(LOCALE["playing_mp3"].interpolate({
            music_name: "MP3",
            music_duration: "#"
        })));
    } else {
        player.appendPlaylist([{
            name: "MP3",
            url: track_url,
            author: "MP3",
            duration: Infinity
        }])
        return message.channel.send(Utils.createSimpleEmbed(LOCALE["musics_added"].title, LOCALE["musics_added"].description.interpolate({
            prefix: process.env.COMMAND_PREFIX
        })));
    }
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

        // const isPremium = await Utils.Profile.isPremium({}, message.author.id)
        const isPremium = config.specialusers.includes(message.author.id)
        message.audioquality = "highestaudio"
        // message.audioquality = "lowestaudio"
        // if (isPremium) {
        //     message.audioquality = "highestaudio"
        // }


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
            return spotifyTrack(client, message, userMsg, LOCALE);
        }

        if (userMsg.includes("open.spotify.com/album/") && url_.includes("open.spotify.com")) {
            return spotifyAlbum(client, message, userMsg, LOCALE);
        }

        if (userMsg.includes("open.spotify.com/episode/") && url_.includes("open.spotify.com")) {
            return podcastEpisode(client, message, userMsg, LOCALE);
        }
        if (userMsg.endsWith(".mp3")) {
            return playMp3(client, message, userMsg, LOCALE);
        }


        return message.channel.send(LOCALE["errors"].not_found)

    },
    get command() {
        return {
            name: 'add',
            description: "Toque playlists do Spotify e do Youtube, links de vídeos, faça buscas de vídeos...",
            aliases: ["youtube", "spotify", "play", "p", "yt", "spt"],
            options: [{
                "type": 3,
                "name": "data",
                "description": "Link do Youtube, Spotify, termo de pesquisa....",
                "default": false,
                "required": true
            }]
        }
    },
};