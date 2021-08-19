const Discord = require('discord.js');
const Utils = require("./../../../utils/utils")
const Music = require("./../utils/Music")
const urlQ = require("url")
const ytdl = require("ytdl-core")
const path = require("path")
// const prism = require('prism-media');
// const ytdl = require(path.join(__dirname, "./../../../libs/yttest/lib/index.js"))

class MusicPlayer {
    /**
     * @param  {Discord.Client} client
     * @param  {Discord.Message} message
     * @param  {String} guild_id
     */
    constructor(guild_id, client, message, type="music", audioquality="lowestaudio") {
        this.guild_id = guild_id;
        this.client = client;
        this.message = message;
        this.isPlaying = false;
        this.dispatcher;
        this.audioquality = audioquality
        this.type = type
        this.time = 0
        this.maxPlaylist = 100
        this.t247 = false;
        this.bitrate = 64
    }
    setAudioQuality(audioquality){
        this.audioquality = audioquality
    }
    getPlaylist() {
        return this.client.playlist.get(this.guild_id)
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
        this.client.playlist.set(this.guild_id, this.getPlaylist().concat(playlist).slice(0,this.maxPlaylist))
    }

    /**
     * @param  {Array} playlist
     */
     unshiftPlaylist(playlist) {
        this.client.playlist.set(this.guild_id, playlist.concat(this.getPlaylist()).slice(0,this.maxPlaylist))
    }

    removePlaylistMusic(index) {
        var plt = this.getPlaylist()
        this.setPlaylist(plt.splice(index, 1))
    }
    /**
     * @param  {Array} musics
     */
    filterPlaylist(musics) {
        var plt = this.getPlaylist()

        for (let index = 0; index < musics.length; index++) {
            const element = musics[index];
            plt = plt.filter(elm=> elm != element)
        }
        this.setPlaylist(plt)
    }

    shufflePlaylist() {
        var current_playlist = this.getPlaylist()
        var new_playlist = [current_playlist[0]]
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
        this.isPlaying = false;
        this.connection.disconnect()
        this.deletePlayer();
        this.deletePlaylist();
    }
    //voltar
    changeTime(secs){
        var current_playlist = this.getPlaylist()
        current_playlist[0].time = secs

        this.time = secs * 1000

        this.setPlaylist(current_playlist)
        if (this.dispatcher){
            this.dispatcher.destroy();
        }
        if(this.type == "mp3"){
            this.playMp3()
        }else{
            this.play()
        }
    }
    setBitrate(value){
        this.bitrate = value
        if(this.dispatcher) this.dispatcher.setBitrate(this.bitrate)
    }
    getStreamTime(){
        if(!this.dispatcher) return 0;
        return this.dispatcher.streamTime;
    }
    getPlayingTime(){
        return this.getStreamTime() + this.time
    }
    getTotalTime(){
        return Utils.hmsToSeconds(this.getPlaylist()[0].duration)*1000 || 0
    }

    aliveConCooldown(){
        if(this.t247 == true) return;
        var intv = setInterval(() => {
            if(!this.connection){
                return clearInterval(intv);
            }
            if(this.connection.channel.members.size <= 1){
                this.connection.disconnect()
                this.deletePlayer();
                this.deletePlaylist();
                return clearInterval(intv);
            }
        }, 10000); 
    }


    async __connectVoice() {
        return new Promise(async (resolve, reject) => {
            try {
                this.connection = await this.message.member.voice.channel.join();
                this.onEventConnections()
                resolve()
            } catch (error) {
                this.message.send_(Utils.createSimpleEmbed("❌ Erro ao executar comando:", `O bot não possui as permissões para executar o comando 😞`, this.client.user.username, this.client.user.avatarURL()));
                return reject(error)
            }
            
        })
    }

    async onEventConnections() {
        this.connection.on("disconnect", () => {
            this.deletePlayer();
            this.deletePlaylist();
            if (this.isPlaying == true){
                this.isPlaying = false;
                return this.message.send_(Utils.createSimpleEmbed("Saindo... Até mais! 😁"));
            }else{
                return;
            }
        })
        this.connection.on("error", (err) => {
            console.log(err)
            this.deletePlayer();
            this.deletePlaylist();
            if (this.isPlaying == true){
                this.isPlaying = false;
                return this.message.send_(Utils.createSimpleEmbed("Saindo... Até mais! 😁"));
            }else{
                return;
            }
        })


        this.connection.on('play', async () => {
            this.isPlaying == true
            if (this.dispatcher) this.dispatcher.destroy();
            var current_playlist = this.getPlaylist()
            if (!current_playlist) return this.message.send_(Utils.createSimpleEmbed("❌ Erro ao digitar comando:", `➡️ Use  **${process.env.COMMAND_PREFIX}play <link do youtube>** para tocar alguma coisa! 🤗`, this.client.user.username, this.client.user.avatarURL()));

            let music_url;

            try {
                if(current_playlist[0]["url"]){
                    music_url = current_playlist[0]["url"]
                }else{
                    music_url = await Music.getVideoLinkBySearch(current_playlist[0]["name"] + " " + current_playlist[0]["author"])
                }

                // console.log(current_playlist[0]["name"], music_url);

                // const filters = [
                //     'bass=g=20,dynaudnorm=f=200',//bassboost
                //     'apulsator=hz=0.08', //8D
                //     'aresample=48000,asetrate=48000*0.8',//vaporwave
                //     'aresample=48000,asetrate=48000*1.25',//nightcore
                //     'aphaser=in_gain=0.4',//phaser
                //     'tremolo',//tremolo
                //     'vibrato=f=6.5',//vibrato
                //     'surround',//surrounding
                //     'apulsator=hz=1',//pulsator
                //     'asubboost',//subboost
                //     'chorus=0.5:0.9:50|60|40:0.4|0.32|0.3:0.25|0.4|0.3:2|2.3|1.3',//chorus of 3
                //     'stereotools=mlev=0.015625',//karaoke
                //     'sofalizer=sofa=/path/to/ClubFritz12.sofa:type=freq:radius=2:rotation=5',//sofa
                //     'silenceremove=window=0:detection=peak:stop_mode=all:start_mode=all:stop_periods=-1:stop_threshold=0',//desilencer
                //     "remove",
                //   ];

                // const transcoder = new prism.FFmpeg({
                //     args: [
                //       '-analyzeduration', '0',
                //       '-loglevel', '0',
                //       '-f', 's16le',
                //       '-ar', '48000',
                //       '-ac', '2',
                //       '-af', filters[0],
                //       "-af", "apulsator=hz=1"
                      
                //     ],
                //   });

                const stream = ytdl(music_url, {
                    filter: 'audioonly',
                    quality: this.audioquality
                });
                // const output = stream.pipe(transcoder);
                
                this.dispatcher = await this.connection.play(stream,
                    {
                        seek: current_playlist[0].time || 0,
                        bitrate: this.bitrate,
                        volume: false
                    }
                )
                // this.dispatcher = await this.connection.play(output,
                //     {
                //         seek: current_playlist[0].time || 0,
                //         bitrate: this.bitrate,
                //         volume: false,
                //         type: 'converted'
                //     }
                // )

                this.aliveConCooldown()
                this.onEventDispatcher()
            } catch (error) {
                console.log("[MusicPlayer][play]",error);
                return this.connection.emit("skip")
            }
            
        });
        this.connection.on('playMp3', async () => {
            if (this.dispatcher) this.dispatcher.destroy();
            var current_playlist = this.getPlaylist()
            if (!current_playlist) return this.message.send_(Utils.createSimpleEmbed("❌ Erro ao digitar comando:", `➡️ Use  **${process.env.COMMAND_PREFIX}play <link do youtube>** para tocar alguma coisa! 🤗`, this.client.user.username, this.client.user.avatarURL()));

            let music_url;

            try {
                if(current_playlist[0]["url"]){
                    music_url = current_playlist[0]["url"]
                }else{
                    music_url = await Music.getVideoLinkBySearch(current_playlist[0]["name"] + " " + current_playlist[0]["author"])
                }

                this.dispatcher = this.connection.play(music_url,
                    {
                        seek: current_playlist[0].time || 0,
                        bitrate: this.bitrate,
                        volume: false
                    }
                )
                this.aliveConCooldown()
                this.onEventDispatcher()
            } catch (error) {
                console.log("[MusicPlayer][playMp3]", error);
                return this.connection.emit("skip")
            }
            
        });
        this.connection.on('shuffle', async () => {
            this.shufflePlaylist()
        });
        this.connection.on('skip', () => {
            if (this.dispatcher) this.dispatcher.destroy();
            var current_playlist = this.getPlaylist()

            this.time = 0

            if (current_playlist.length <= 1) {
                this.connection.disconnect()
                this.deletePlayer();
                this.deletePlaylist();
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
        this.dispatcher.on('finish', (msg) => {
            if (this.dispatcher) this.dispatcher.destroy()
            var playlist = this.getPlaylist()
            this.time = 0
            if (this.connection.channel.members.size <= 1 && this.t247 == false) {
                this.connection.disconnect()
                this.deletePlayer();
                this.deletePlaylist();
                return;
            }
            if (playlist.length <= 1) {
                this.connection.disconnect()
                this.deletePlayer();
                this.deletePlaylist();
                return;
            } else {
                var x = playlist
                x.splice(0, 1)
                this.setPlaylist(x)
                this.play()
                return;
            }
        });
        this.dispatcher.on('error', (err) => {
            console.log("[MusicPlayer][dispatcher]", err);
            return this.connection.emit("skip")
        });
    }



}


module.exports = MusicPlayer