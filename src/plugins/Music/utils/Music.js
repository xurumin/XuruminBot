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
const { resolve } = require('path');
let spotifyApi = new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_SECRET
});

module.exports = {
    
    authorizeSpotify() {
        var a = this
        spotifyApi.clientCredentialsGrant()
            .then(function (data) {
                console.log('The access token expires in ' + data.body['expires_in']);
                console.log('The access token is ' + data.body['access_token']);
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
            if(!process.env.SPOTIFY_TOKEN){ authorizeSpotify();}
            this.setSpotifyToken();

            spotifyApi.getPlaylist(playlist_id)
            .then((data) => {
                var music_list = []
                Utils
                .shuffle(data["body"]["tracks"]["items"])
                .slice(0, limit).forEach(element => {
                    music_list.push({
                        name: element["track"]["name"],
                        author: element["track"]["album"]["artists"][0]["name"],
                        duration: Utils.toHHMMSS(element["track"]["duration_ms"] / (1000))
                    })
                })
                resolve( music_list )
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
                console.log(res["items"])
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
                console.log(err)
                reject(err)
            })
        })
    },

    // getVideoLinkBySearch(name) {
    //     return new Promise((resolve, reject)=>{
    //         ytsr(name, {
    //             limit: 1
    //         }).then(data => {
    //             console.log(data)
    //             resolve(data["items"][0]["link"])
    //         }).catch(err => {
    //             reject(err)
    //         });
    //     })
    // },
    getVideoLinkBySearch(name) {
        return new Promise((resolve, reject)=>{
            temoytsearch(name)
            .then((data)=>{
                var url = `https://www.youtube.com/watch?v=${data[0]["id"]}`
                resolve(url)
            })
            .catch((err)=>{
                reject(err)
            })
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
                var video_dat = await ytdl.getBasicInfo(url)
                video_dat = video_dat["playerResponse"]["videoDetails"]
                const video_info = {
                    name: video_dat["title"],
                    url: url,
                    author: video_dat["author"],
                    duration: this.toHHMMSS(video_dat["lengthSeconds"])
                }
                resolve(video_info)
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
    }
}