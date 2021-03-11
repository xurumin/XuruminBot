const {
    default: axios
} = require("axios")
const Music = require('./../../../Music/utils/Music');
const Utils = require("./../../../../utils/utils")
const ytdl = require("ytdl-core")
const EE = require("events").EventEmitter
const Discord = require("discord.js")

class MusicPlayerClass {
    constructor() {

    }
    async init(message, client) {
        this.client = client
        this.message = message
        this.connection = await message.member.voice.channel.join()
    }

    async checkIfThereArePlayers() {
        return new Promise(async (resolve, reject) => {
            var runner = setInterval(() => {
                if (!this.connection || this.connection == {} || this.connection.channel.members.size <= 1) {
                    clearInterval(runner);
                    return resolve()
                }
            }, 5000);
        })
    }

    async play(url, time = 10000) {
        try {
            var stream = ytdl(url, {
                filter: 'audioonly',
                quality: 'lowestaudio'
            });
            var dispatcher = await this.connection.play(stream)
            setTimeout(()=>{
                dispatcher.destroy()
                stream.destroy()
                return;
            }, time)
        } catch (error) {
            console.log(error);
        }
    }

    leave() {
        this.connection.disconnect()
        this.connection = {}
        this.client.playingWITM.delete(this.message.guild.id)
    }
}

class Game {
    constructor(){
        this.EventEmitter = new EE()
        this.isOpen = false
        this.leaderboard = new Discord.Collection()
    }
    async getRandomMusic(playlistUrl) {
        try {
            var music = (await Music.getSpotifyPlaylist(playlistUrl, 1))[0]
            var search_term = music.name + " " + music.author
            music.url = (await Music.getVideoLinkBySearch(search_term))
        } catch (error) {
            return this.getRandomMusic(playlistUrl)
        }
        return music
    }
    play_game(MusicPlayer,LOCALE, message, plt_url, cb) {
        return new Promise(async (resolve, reject)=>{
            var random_music = await this.getRandomMusic(plt_url)
            cb()
            this.isOpen = true
            this.random_music = random_music

            this.gm_tm = setTimeout(()=>{
                if(!this.isOpen) return;
                this.isOpen = false;
                return this.EventEmitter.emit("round", {
                    status: 0
                })
            }, 60000)

            MusicPlayer.play(random_music.url, 15000)
    
            this.EventEmitter.on("pgra", async (playerId)=>{
                if(this.isOpen == false){
                    return;
                }

                clearTimeout(this.gm_tm)

                this.isOpen = false
                await message.channel.send(LOCALE["messages"]["right_answer"].interpolate({
                    author: `<@${playerId}>`,
                    music_name: `${this.random_music.name} - ${this.random_music.author}`
                }))
                if(this.leaderboard.has(playerId)){
                    this.leaderboard.set(playerId, parseInt(this.leaderboard.get(playerId)) + 1)
                }else{
                    this.leaderboard.set(playerId, 1)
                }
                return this.EventEmitter.emit("round", {
                    status: 1,
                    playerId: playerId,
                    music: `${this.random_music.name} - ${this.random_music.author}`
                })
            })
        })
    }

    musicMatch(term){
        term = term.toLowerCase()
        var title = this.random_music.name.toLowerCase()
        title = title.split("(")[0]
        title=title.split(" ").join("")

        title = title.split("-")[0]
        title=title.split(" ").join("")

        term=term.split(" ").join("")

        var smty = this.similarity(term, title)

        if(smty >= 0.85){
            return [true, smty]
        }else{
            return [false, smty]
        }
    }

    async playerGRAnswer(playerId){
        this.EventEmitter.emit("pgra", playerId)
    }


    similarity(s1, s2) {
        var longer = s1;
        var shorter = s2;
        if (s1.length < s2.length) {
          longer = s2;
          shorter = s1;
        }
        var longerLength = longer.length;
        if (longerLength == 0) {
          return 1.0;
        }
        return (longerLength - this.__editDistance(longer, shorter)) / parseFloat(longerLength);
      }

    __editDistance(s1, s2) {
        s1 = s1.toLowerCase();
        s2 = s2.toLowerCase();
      
        var costs = new Array();
        for (var i = 0; i <= s1.length; i++) {
          var lastValue = i;
          for (var j = 0; j <= s2.length; j++) {
            if (i == 0)
              costs[j] = j;
            else {
              if (j > 0) {
                var newValue = costs[j - 1];
                if (s1.charAt(i - 1) != s2.charAt(j - 1))
                  newValue = Math.min(Math.min(newValue, lastValue),
                    costs[j]) + 1;
                costs[j - 1] = lastValue;
                lastValue = newValue;
              }
            }
          }
          if (i > 0)
            costs[s2.length] = lastValue;
        }
        return costs[s2.length];
      }

    MusicPlayer() {
        return new MusicPlayerClass()
    }

}
module.exports = Game