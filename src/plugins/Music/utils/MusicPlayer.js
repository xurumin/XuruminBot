const Discord = require('discord.js');
const Utils = require("./../../../utils/utils")
const Music = require("./../utils/Music")
const urlQ = require("url")
const ytdl = require("ytdl-core")
const path = require("path")
const {
    AudioPlayerStatus,
    StreamType,
    createAudioPlayer,
    createAudioResource,
    joinVoiceChannel,
} = require('@discordjs/voice');
const prism = require('prism-media');

var FfmpegCommand = require('fluent-ffmpeg');

const ffprobestatic = require("ffprobe-static")
const ffmpegstatic = require("ffmpeg-static");
const { default: axios } = require('axios');

FfmpegCommand.setFfmpegPath(ffmpegstatic)
FfmpegCommand.setFfprobePath(ffprobestatic.path)

const Sentry = require("@sentry/node");

Sentry.init({
	dsn: process.env.SENTRY_DNS
});

// const ytdl = require(path.join(__dirname, "./../../../libs/yttest/lib/index.js"))

class MusicPlayer {
    /**
     * @param  {Discord.Client} client
     * @param  {Discord.Message} message
     * @param  {String} guild_id
     */
    constructor(guild_id, client, message, type = "music", audioquality = "lowestaudio") {
        this.guild_id = guild_id;
        this.client = client;
        this.message = message;
        this.isPlaying = true;
        this.audioquality = audioquality
        this.type = type
        this.time = 0
        this.maxPlaylist = 100
        this.t247 = false;
        this.bitrate = 64
        this.soundEffects = []
        this.soundEffectsList = {
            bassboost: 'bass=g=20,dynaudnorm=f=200',
            "8D": 'apulsator=hz=0.08',
            vaporwave: 'aresample=48000,asetrate=48000*0.8',
            nightcore: 'aresample=48000,asetrate=48000*1.25',
            phaser: 'aphaser=in_gain=0.4',
            tremolo: 'tremolo',
            vibrato: 'vibrato=f=6.5',
            surrounding: 'surround',
            pulsator: 'apulsator=hz=1',
            subboost:'asubboost',
            chorus:'chorus=0.5:0.9:50|60|40:0.4|0.32|0.3:0.25|0.4|0.3:2|2.3|1.3',
            karaoke:'stereotools=mlev=0.015625',
            sofa:'sofalizer=sofa=/path/to/ClubFritz12.sofa:type=freq:radius=2:rotation=5',
            desilencer:'silenceremove=window=0:detection=peak:stop_mode=all:start_mode=all:stop_periods=-1:stop_threshold=0',
            reverb: "aecho=1.0:0.7:20:0.5",
            lofi: "highpass=f=200, lowpass=f=3000, aecho=1.0:0.7:20:0.5, bass=g=10,dynaudnorm=f=200"
        }
        this.isIdle = false;
    }
    setAudioQuality(audioquality) {
        this.audioquality = audioquality
    }
    getPlaylist() {
        return this.client.playlist.get(this.guild_id)
    }

    addSoundEffects(effect){
        return this.soundEffects.push("-af", effect)
    }

    /**
     * @param  {Array} playlist
     */
    setPlaylist(playlist) {
        this.client.playlist.set(this.guild_id, playlist)
    }
    /**
     * @param  {Array} playlist
     */
    appendPlaylist(playlist) {
        this.client.playlist.set(this.guild_id, this.getPlaylist().concat(playlist).slice(0, this.maxPlaylist))
    }

    /**
     * @param  {Array} playlist
     */
    unshiftPlaylist(playlist) {
        this.client.playlist.set(this.guild_id, playlist.concat(this.getPlaylist()).slice(0, this.maxPlaylist))
    }

    removePlaylistMusic(index) {
        let plt = this.getPlaylist()
        this.setPlaylist(plt.splice(index, 1))
    }
    /**
     * @param  {Array} musics
     */
    filterPlaylist(musics) {
        let plt = this.getPlaylist()

        for (let index = 0; index < musics.length; index++) {
            const element = musics[index];
            plt = plt.filter(elm => elm != element)
        }
        this.setPlaylist(plt)
    }

    shufflePlaylist() {
        let current_playlist = this.getPlaylist()
        let new_playlist = [current_playlist[0]]
        current_playlist.shift();
        new_playlist = new_playlist.concat(Utils.shuffle(current_playlist))
        this.client.playlist.set(this.guild_id, new_playlist)
    }
    deletePlaylist() {
        return this.client.playlist.delete(this.guild_id)
    }
    deletePlayer() {
        return this.client.players.delete(this.guild_id)
    }

    play() {
        return this.connection.emit("play")
    }
    playMp3() {
        return this.connection.emit("playMp3")
    }
    skip() {
        return this.connection.emit("skip")
    }
    pause() {
        return this.connection.emit("pause")
    }
    resume() {
        return this.connection.emit("resume")
    }
    leave() {
        if(this.isPlaying === false) return;
        this.isPlaying = false;
        try {
            this.connection.disconnect()
            this.deletePlayer();
            this.deletePlaylist();
        } catch (error) {
            return;
        }
    }
    //voltar
    changeTime(secs) {
        let current_playlist = this.getPlaylist()
        current_playlist[0].time = secs

        this.time = secs * 1000

        this.setPlaylist(current_playlist)
        if (this.type == "mp3") {
            this.playMp3()
        } else {
            this.play()
        }
    }
    setBitrate(value) {
        this.bitrate = value
        // if(this.dispatcher) this.dispatcher.setBitrate(this.bitrate)
    }
    getStreamTime() {
        return Date.now() - this.creationTime;
    }
    getPlayingTime() {
        return this.getStreamTime() + this.time
    }
    getTotalTime() {
        return Utils.hmsToSeconds(this.getPlaylist()[0].duration) * 1000 || 0
    }

    aliveConCooldown() {
        if (this.t247 == true) return;
        let intv = setInterval(() => {
            console.log(this.voiceChat.members.size);
            try {
                if (!this.connection) {
                    return clearInterval(intv);
                }
                if (this.voiceChat.members.size <= 1) {
                    this.leave()
                    console.log("a");
                    // this.connection.destroy()
                    // this.deletePlayer();
                    // this.deletePlaylist();
                    return clearInterval(intv);
                }
            } catch (error) {
                return clearInterval(intv);
            }
        }, 10000);
    }


    async __connectVoice() {
        return new Promise(async (resolve, reject) => {
            try {
                this.connection = joinVoiceChannel({
                    channelId: this.message.member.voice.channel.id,
                    guildId: this.message.guild.id,
                    adapterCreator: this.message.guild.voiceAdapterCreator,
                });

                this.voiceChat = this.message.member.voice.channel

                this.player = createAudioPlayer();
                this.player.setMaxListeners(1)
                this.connection.subscribe(this.player);

                this.onEventDispatcher();
                this.onEventConnections();
                this.aliveConCooldown();
                resolve()
            } catch (error) {
                this.message.send_(Utils.createSimpleEmbed("❌ Erro ao executar comando:", `O bot não possui as permissões para executar o comando 😞`, this.client.user.username, this.client.user.avatarURL()));
                return reject(error)
            }

        })
    }

    async onEventConnections() {
        this.connection.on('destroyed', () => {
            this.deletePlayer();
            this.deletePlaylist();
            if (this.isPlaying == true) {
                this.isPlaying = false;
                return this.message.send_(Utils.createSimpleEmbed("Saindo... Até mais! 😁"));
            } else {
                return;
            }
        })
        this.connection.on("error", (err) => {
            console.log(err)
            this.deletePlayer();
            this.deletePlaylist();
            if (this.isPlaying == true) {
                this.isPlaying = false;
                return this.message.send_(Utils.createSimpleEmbed("Saindo... Até mais! 😁"));
            } else {
                return;
            }
        })

        this.connection.on('play', async () => {
            this.creationTime = Date.now();
            this.isPlaying = true;
            let current_playlist = this.getPlaylist()
            if (!current_playlist) return this.message.send_(Utils.createSimpleEmbed("❌ Erro ao digitar comando:", `➡️ Use  **${process.env.COMMAND_PREFIX}play <link do youtube>** para tocar alguma coisa! 🤗`, this.client.user.username, this.client.user.avatarURL()));

            let music_url;

            try {
                if (current_playlist[0]["url"]) {
                    music_url = current_playlist[0]["url"]
                } else {
                    music_url = await Music.getVideoLinkBySearch(current_playlist[0]["name"] + " " + current_playlist[0]["author"])
                }

                const stream = ytdl(music_url, {
                    filter: 'audioonly',
                    quality: this.audioquality
                });

                let streamtimes = current_playlist[0].time || 0
                streamtimes = Utils.toHHMMSS(streamtimes)

                const transcoder = new prism.FFmpeg({
                    args: [
                        '-analyzeduration', '0',
                        '-loglevel', '0',
                        '-ar', '48000',
                        '-acodec', 'libopus',
                        '-f', 'opus',
                        "-ss", streamtimes,
                        ...this.soundEffects
                    ],
                });

                const output = stream.pipe(transcoder);

                const resource = createAudioResource(output, {
                    inputType: StreamType.OggOpus
                });
                
                this.player.play(resource);
                // this.connection.subscribe(this.player);
                // this.onEventDispatcher()

                stream.on('error', error => {
                    console.log("[PLAYER STREAM]",error);
                    this.skip()
                    if(process.env.NODE_ENV != "development"){
                        // Sentry.captureException(error, {
                        //     tags: {
                        //         section: "Player Stream"
                        //     }
                        // })
                    }
                });
                this.connection.on('error', error => {
                    console.log("[Connection STREAM]",error);

                    if(process.env.NODE_ENV != "development"){
                        Sentry.captureException(error, {
                            tags: {
                                section: "Player Connection"
                            }
                        })
                    }
                });
            } catch (error) {
                console.log("[MusicPlayer][play]", error);
                return this.connection.emit("skip")
            }

        });
        this.connection.on("stateChange",(state)=>{
            if(state.status == "disconnected"){
                this.leave();
            }
        })
        this.connection.on('playMp3', async () => {
            this.creationTime = Date.now()
            let current_playlist = this.getPlaylist()
            if (!current_playlist) return this.message.send_(Utils.createSimpleEmbed("❌ Erro ao digitar comando:", `➡️ Use  **${process.env.COMMAND_PREFIX}play <link do youtube>** para tocar alguma coisa! 🤗`, this.client.user.username, this.client.user.avatarURL()));

            let music_url;

            try {
                if (current_playlist[0]["url"]) {
                    music_url = current_playlist[0]["url"]
                } else {
                    music_url = await Music.getVideoLinkBySearch(current_playlist[0]["name"] + " " + current_playlist[0]["author"])
                }
                let streamtimes = current_playlist[0].time || 0
                streamtimes = Utils.toHHMMSS(streamtimes)

                const transcoder = new prism.FFmpeg({
                    args: [
                        '-analyzeduration', '0',
                        '-loglevel', '0',
                        '-ar', '48000',
                        '-acodec', 'libopus',
                        "-ss", streamtimes,
                        '-f', 'opus'
                    ],
                });

                axios(
                    {
                        method: 'get',
                        url: music_url,
                        responseType: 'stream'
                      }
                ).then(res=>{
                    let output = res.data.pipe(transcoder)
                    const resource = createAudioResource(output, {
                        inputType: StreamType.Arbitrary
                    });

                    this.player.play(resource);
                })
            } catch (error) {
                console.log("[MusicPlayer][playMp3]", error);
                return this.connection.emit("skip")
            }

        });
        this.connection.on('shuffle', async () => {
            this.shufflePlaylist()
        });
        this.connection.on('skip', () => {
            let current_playlist = this.getPlaylist() ?? []

            this.time = 0

            if (current_playlist.length <= 1) {
                this.leave()
                // this.connection.destroy()
                // this.deletePlayer();
                // this.deletePlaylist();
            } else {
                current_playlist.splice(0, 1)
                this.setPlaylist(current_playlist)
                this.connection.emit("play")
            }
        });
        this.connection.on('pause', () => {
            if (this.dispatcher) this.dispatcher.pause();
        });
        this.connection.on('resume', () => {
            if (this.dispatcher) this.dispatcher.resume();
        });

    }
    onEventDispatcher() {
        this.player.on(AudioPlayerStatus.Idle, (msg) => {
            if (!this.connection) return;
            if(this.isIdle == true) return;
            this.isIdle = true;
            setTimeout(() => {
                this.isIdle = false
            }, 1000);

            let playlist = this.getPlaylist()

            if (!playlist || playlist == []) {
                this.deletePlayer();
                this.deletePlaylist();
                return;
            };
            this.time = 0
            if ((this.voiceChat.members.size <= 1 && this.t247 == false) || (playlist && playlist.length <= 1)) {
                // this.connection.destroy()
                // this.deletePlayer();
                // this.deletePlaylist();
                return this.leave();
            } else {
                let x = playlist
                x.splice(0, 1)
                this.setPlaylist(x)
                this.play()
                return;
            }
        });
        this.player.on('error', (err) => {
            console.log("[MusicPlayer][player]", err);
            return this.connection.emit("skip")
        });
    }



}


module.exports = MusicPlayer