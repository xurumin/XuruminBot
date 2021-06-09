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
        this.runner = {}
    }

    async checkIfThereArePlayers() {
        return new Promise(async (resolve, reject) => {
            this.runner = setInterval(() => {
                if (!this.connection || this.connection == {} || !this.connection.channel  || (this.connection.channel && this.connection.channel.members.size <= 1)) {
                    clearInterval(this.runner);
                    return resolve()
                }
            }, 5000);
        })
    }

    async play(url, time = 10000) {
        try {
            var stream = ytdl(url, {
                filter: 'audioonly'
            });
            var dispatcher = await this.connection.play(stream)
            setTimeout(() => {
                dispatcher.destroy()
                stream.destroy()
                return;
            }, time)
        } catch (error) {
            console.log(error);
        }
    }

    async leave() {
        clearInterval(this.runner);
        await this.connection.disconnect()
    }
}

class Game {
    constructor(client, message, LOCALE) {
        this.EventEmitter = new EE()
        this.isOpen = false
        this.leaderboard = new Discord.Collection()
        this.state = false;
        this.client = client
        this.message = message
        this.LOCALE = LOCALE
        this.isPlaying == true
        this.MusicPlayer = new MusicPlayerClass()
        this.eventListening()
    }
    async startGame(game_info){
        this.game_info = game_info
        await this.MusicPlayer.init(this.message, this.client)
        this.count = 0;
        this.play_game(this.message, this.game_info.playlist, () => {
            this.message.channel.send(new Discord.MessageEmbed().setTitle(
                this.LOCALE["messages"]["playing"].interpolate({
                    index: this.count + 1
                })
            ))
        })
    }
    eventListening() {
        this.EventEmitter.on("leave", async () => {
            this.count = this.game_info.rounds+1
            this.isPlaying == false;
            await this.MusicPlayer.leave()
            this.client.playingWITM.delete(this.message.guild.id)
        })
        this.EventEmitter.on("round", async (res) => {
            this.count += 1
            if (this.count >= this.game_info.rounds || this.isPlaying==false) {
                return this.EventEmitter.emit("finish")
            }
            if (res.status == 0) {
                await this.message.channel.send(
                    this.LOCALE["messages"]["timeout"].interpolate({
                        music_name: res.music
                    }))
            }

            this.play_game(this.message, this.game_info.playlist, () => {
                this.message.channel.send(new Discord.MessageEmbed().setTitle(
                    this.LOCALE["messages"]["playing"].interpolate({
                        index: this.count + 1
                    })
                ))
            })
        })
        this.EventEmitter.on("finish", async () => {
            var leaderboard = this.leaderboard.sort().keyArray()

            var winner_id = leaderboard[leaderboard.length - 1]

            var embed = new Discord.MessageEmbed()
            .setTitle(
                this.LOCALE["messages"]["game_over"].title
            )
            .setDescription(
                this.LOCALE["messages"]["game_over"].description.interpolate({
                    points: this.leaderboard.get(winner_id),
                    author: `<@${winner_id}>`,
                    total: this.game_info.rounds
                })
            )
            if(!winner_id){
                embed.setDescription("")
            }
            this.message.channel.send(embed)

            this.EventEmitter.emit("leave")
        })
        this.MusicPlayer.checkIfThereArePlayers()
            .then(() => {
                if (!this.client.playingWITM.get(this.message.guild.id)) {
                    return;
                }
                this.message.channel.send(this.LOCALE["messages"]["leaving"])
                this.EventEmitter.emit("leave")
            })
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
    play_game(message, plt_url, cb) {
        return new Promise(async (resolve, reject) => {
            var random_music = await this.getRandomMusic(plt_url)
            cb()
            this.isOpen = true
            this.random_music = random_music

            this.gm_tm = setTimeout(() => {
                if (!this.isOpen) return;
                this.isOpen = false;
                return this.EventEmitter.emit("round", {
                    status: 0,
                    music: `${this.random_music.name} - ${this.random_music.author}`
                })
            }, 60000)

            this.MusicPlayer.play(random_music.url, 15000)

            this.EventEmitter.on("pgra", async (playerId) => {
                if (this.isOpen == false) {
                    return;
                }

                clearTimeout(this.gm_tm)

                this.isOpen = false
                await this.message.channel.send(this.LOCALE["messages"]["right_answer"].interpolate({
                    author: `<@${playerId}>`,
                    music_name: `${this.random_music.name} - ${this.random_music.author}`
                }))
                if (this.leaderboard.has(playerId)) {
                    this.leaderboard.set(playerId, parseInt(this.leaderboard.get(playerId)) + 1)
                } else {
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

    musicMatch(term) {
        term = term.toLowerCase()
        var title = this.random_music.name.toLowerCase()
        title = title.split("(")[0]
        title = title.split(" ").join("")

        title = title.split("-")[0]
        title = title.split(" ").join("")

        term = term.split(" ").join("")

        var smty = this.similarity(term, title)

        if (smty >= 0.85) {
            return [true, smty]
        } else {
            return [false, smty]
        }
    }

    async playerGRAnswer(playerId) {
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

}
module.exports = Game