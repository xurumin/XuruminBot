const Discord = require('discord.js');
const urlQ = require("url")
const ytsr = require('ytsr');
const ytpl = require('ytpl');
const ytdl = require("ytdl-core")

const solenolyrics = require("solenolyrics")

const temoytsearch = require('./../utils/YoutubeSearchTemp');

const Utils = require("./../../../utils/utils")
require('dotenv/config');

const SpotifyWebApi = require('spotify-web-api-node');
const { default: axios } = require('axios');
let spotifyApi = new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_SECRET
});

module.exports = {
    
    authorizeSpotify() {
        var a = this
        spotifyApi.clientCredentialsGrant()
            .then(function (data) {
                //console.log('The access token expires in ' + data.body['expires_in']);
                //console.log('The access token is ' + data.body['access_token']);
                // Save the access token so that it's used in future calls
                process.env.SPOTIFY_TOKEN = data.body['access_token']
                a.setSpotifyToken();
            }, function (err) {
                console.log('Something went wrong when retrieving an access token', err.message);
            });
    },
    setSpotifyToken(){
        spotifyApi.setAccessToken(process.env.SPOTIFY_TOKEN);
    },
    getSpotifyPlaylist(playlist_url, limit = 15) {
        let splt = String(playlist_url).split("/")
        var playlist_id = splt[splt.length - 1]

        return new Promise((resolve, reject)=>{

            spotifyApi.getPlaylist(playlist_id)
            .then((data) => {
                resolve(
                    Utils
                    .shuffle(data["body"]["tracks"]["items"])
                    .slice(0, limit).map(element => {
                        if(!element["track"]) return;
                        return {
                            name: element["track"]["name"],
                            author: element["track"]["album"]["artists"][0]["name"],
                            duration: Utils.toHHMMSS(element["track"]["duration_ms"] / (1000))
                        }
                    })
                    )
            }).catch(function (err) {
                reject( err )
            })

        })
    },
    getSpotifyTrack(track_url) {
        let spttrack = urlQ.parse(track_url).path.split("/").pop()
        return new Promise((resolve, reject)=>{
            if(!process.env.SPOTIFY_TOKEN){
                authorizeSpotify();
                this.setSpotifyToken();
            }
            spotifyApi.getTrack(spttrack)
            .then((data) => {
                return resolve(
                    {
                        name: data["body"]["name"],
                        author: data["body"]["album"]["artists"][0]["name"],
                        duration: Utils.toHHMMSS(data["body"]["duration_ms"] / (1000))
                    }
                )
            }).catch(function (err) {
                reject( err )
            })

        })
    },
    getSpotifyPodcastEp(track_url) {
        let spttrack = urlQ.parse(track_url).path.split("/").pop()
        return new Promise((resolve, reject)=>{
            if(!process.env.SPOTIFY_TOKEN){
                authorizeSpotify();
                this.setSpotifyToken();
            }
            spotifyApi.getEpisode(spttrack,{
                market: "BR"
            })
            .then(async (data) => {
                //var sp_info = await axios.get(`https://spclient.wg.spotify.com/soundfinder/v1/unauth/episode/${data["body"]["id"]}/com.widevine.alpha?market=BR`)
                return resolve(
                    {
                        name: data["body"]["name"],
                        show_name: data["body"]["show"]["name"],
                        publisher: data["body"]["show"]["publisher"],
                        duration: Utils.toHHMMSS(data["body"]["duration_ms"] / (1000)),
                        duration_ms: data["body"]["duration_ms"]
                    }
                    // url: `https://anon-podcast.scdn.co/${data["body"]["audio_preview_url"].split("/").pop()}`
                    //https://spclient.wg.spotify.com/soundfinder/v1/unauth/episode/1r38FxmFb5Dzql4TLs0Lk2/com.widevine.alpha?market=BR

                    //https://spclient.wg.spotify.com/soundfinder/v1/unauth/episode/08Sb0rruDu2TXGehKQ1bgL/com.widevine.alpha?market=BR
                )
            }).catch(function (err) {
                reject( err )
            })

        })
    },
    getSpotifyPodcastShow(track_url) {
        let spttrack = urlQ.parse(track_url).path.split("/").pop()
        return new Promise((resolve, reject)=>{
            if(!process.env.SPOTIFY_TOKEN){
                authorizeSpotify();
                this.setSpotifyToken();
            }
            spotifyApi.getShow(spttrack,{
                market: "BR"
            })
            .then(async (data) => {
                return resolve(data["body"])
            }).catch(function (err) {
                reject( err )
            })

        })
    },
    getSpotifyAlbum(album_url, limit=20) {
        let album_id = urlQ.parse(album_url).path.split("/").pop()
        return new Promise((resolve, reject)=>{
            spotifyApi.getAlbumTracks(album_id)
            .then((data) => {
                resolve(
                    Utils
                    .shuffle(data["body"]["tracks"]["items"])
                    .slice(0, limit).map(element => {
                        return {
                            name: element["name"],
                            author: element["artists"][0]["name"],
                            duration: Utils.toHHMMSS(element["duration_ms"] / (1000))
                        }
                    })
                    )
            }).catch(function (err) {
                reject( err )
            })

        })
    },
    getYoutubePlaylistByUrl(url, limit) {
        return new Promise(async (resolve, reject)=>{
            var playlist_id = urlQ.parse(url, true).query.list
            if (!playlist_id) {
                reject("invalid youtube playlist url")
            }
            ytpl(playlist_id, {
                limit: limit
            }).then(res => {
               var playlist = res["items"]
                .map((element)=>{
                    if (element["title"] && element["url"] && element["author"]) {
                        return {
                            name: element["title"],
                            url: element["url"],
                            author: element["author"]["name"],
                            duration: element["duration"]
                        }
                    }
                })
                resolve(playlist)
            })
            .catch(err => {
                reject(err)
            })
        })
    },
    getVideoLinkBySearch(name) {
        return new Promise(async (resolve, reject)=>{
            let filter = await ytsr.getFilters(term);
            filter = filter.get('Type').get('Video')

            ytsr(filter.url, {
                limit: 1
            })
            .then((data)=>{
                resolve(data["items"][0]["url"])
            })
            .catch((err)=>{
                reject(err)
            })
        })
    },
    searchYoutubeVideos(term, limit=5) {
        return new Promise(async (resolve, reject)=>{
            let filter = await ytsr.getFilters(term);
            filter = filter.get('Type').get('Video')
            ytsr(filter.url, {
                limit: limit
            }).then(data => {
                resolve(data["items"])
            }).catch(err => {
                reject(err)
            });
        })
    },
    
    toHHMMSS(secs){
        var sec_num = parseInt(secs, 10)
        var hours   = Math.floor(sec_num / 3600)
        var minutes = Math.floor(sec_num / 60) % 60
        var seconds = sec_num % 60
    
        return [hours,minutes,seconds]
            .map(v => v < 10 ? "0" + v : v)
            .filter((v,i) => v !== "00" || i > 0)
            .join(":")
    },
    getVideoInfoByUrl(url) {
        return new Promise(async (resolve, reject) => {
            try {
                var video_dat = (await ytsr(url, {
                    limit: 3
                }))["items"][0]

                return resolve({
                    name: video_dat["title"],
                    url: url,
                    author: video_dat["author"].name,
                    duration: video_dat["duration"]
                })
                // var video_dat = await ytdl.getBasicInfo(url)
                // video_dat = video_dat["videoDetails"]
                // const video_info = {
                //     name: video_dat["title"],
                //     url: url,
                //     author: video_dat["author"].name,
                //     duration: this.toHHMMSS(video_dat["lengthSeconds"])
                // }
                // resolve(video_info)
            } catch (error) {
                reject(error)
            }
        })
    },
    getLyricByMusicName(music_name){
        return new Promise(async (resolve, reject)=>{
            let search_term = String(music_name)
            .toLocaleLowerCase()
            .replace(/[\W_]+/g," ")
            .replace(/video/g, "")
            .replace(/official/g, "")
            let lyric = await solenolyrics.requestLyricsFor(search_term)
            if(!lyric){
                return reject("music not found")
            }
            if(lyric.length > 3000){
                return reject("music not found")
            }
            return resolve(lyric)
        })
    },
    async __sendRects(message) {
        await message.react("1️⃣")
        await message.react("2️⃣")
        await message.react("3️⃣")
        await message.react("4️⃣")
        await message.react("5️⃣")
    },
    getReact(message, originalAuthor="") {
        return new Promise(async (resolve, reject) => {
            this.__sendRects(message)
            const filter = (reaction, user) => {
                return ( !(message.author==user) && (originalAuthor == user));
            };
            message.awaitReactions({
                    filter,
                    max: 1,
                    time: 120000,
                    errors: ['time']
                })
                .then(collected => {
                    const reaction = collected.first();
                    var index = 0
                    switch (reaction.emoji.name) {
                        case "1️⃣":
                            index = 0
                            break;
                        case "2️⃣":
                            index = 1
                            break;
                        case "3️⃣":
                            index = 2
                            break;
                        case "4️⃣":
                            index = 3
                            break;
                        case "5️⃣":
                            index = 4
                            break;
                        case "⏪":
                            index = 5
                            break;
                        case "⏩":
                            index = 6
                            break;
                        default:
                            return resolve(-1)
                            break;
                    }
                    return resolve(index)
                })
                .catch(collected => {
                    return resolve(-1)
                });

        })
    }
}