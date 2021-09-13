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
            try {
                if(!this.connection){
                    return clearInterval(intv);
                }
                if(this.voiceChat.members.size <= 1){
                    this.connection.destroy()
                    this.deletePlayer();
                    this.deletePlaylist();
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
                this.connection.subscribe(this.player);

                this.onEventConnections()
                this.aliveConCooldown() 
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
            var current_playlist = this.getPlaylist()
            if (!current_playlist) return this.message.send_(Utils.createSimpleEmbed("❌ Erro ao digitar comando:", `➡️ Use  **${process.env.COMMAND_PREFIX}play <link do youtube>** para tocar alguma coisa! 🤗`, this.client.user.username, this.client.user.avatarURL()));

            let music_url;

            try {
                if(current_playlist[0]["url"]){
                    music_url = current_playlist[0]["url"]
                }else{
                    music_url = await Music.getVideoLinkBySearch(current_playlist[0]["name"] + " " + current_playlist[0]["author"])
                }

                const stream = ytdl(music_url, {
                    filter: 'audioonly',
                    quality: this.audioquality
                });

                const resource = createAudioResource(stream, { inputType: StreamType.Arbitrary });

                this.player.play(resource);

                stream.on('error', error => {
                    console.log(error);
                });
                this.connection.on('error', error => {
                    console.log(error);
                });
                this.player.on('error', error => {
                    console.error(`Error: ${error.message} with resource ${error.resource.metadata.title}`);
                });

                this.aliveConCooldown()
                this.onEventDispatcher()
            } catch (error) {
                console.log("[MusicPlayer][play]",error);
                return this.connection.emit("skip")
            }
            
        });
        this.connection.on('playMp3', async () => {
            var current_playlist = this.getPlaylist()
            if (!current_playlist) return this.message.send_(Utils.createSimpleEmbed("❌ Erro ao digitar comando:", `➡️ Use  **${process.env.COMMAND_PREFIX}play <link do youtube>** para tocar alguma coisa! 🤗`, this.client.user.username, this.client.user.avatarURL()));

            let music_url;

            try {
                if(current_playlist[0]["url"]){
                    music_url = current_playlist[0]["url"]
                }else{
                    music_url = await Music.getVideoLinkBySearch(current_playlist[0]["name"] + " " + current_playlist[0]["author"])
                }

                
                const resource = createAudioResource(music_url, { inputType: StreamType.Arbitrary});
                console.log("a");
                const player = createAudioPlayer();
                player.on("error", error=>{
                    console.log(error);
                })
                player.play(resource)
                this.connection.subscribe(player)

                // this.dispatcher = this.connection.play(music_url,
                //     {
                //         seek: current_playlist[0].time || 0,
                //         bitrate: this.bitrate,
                //         volume: false
                //     }
                // )
                // this.aliveConCooldown()
                // this.onEventDispatcher()
            } catch (error) {
                console.log("[MusicPlayer][playMp3]", error);
                return this.connection.emit("skip")
            }
            
        });
        this.connection.on('shuffle', async () => {
            this.shufflePlaylist()
        });
        this.connection.on('skip', () => {
            var current_playlist = this.getPlaylist()

            this.time = 0

            if (current_playlist.length <= 1) {
                this.connection.destroy()
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
        this.player.on(AudioPlayerStatus.Idle, (msg) => {
            var playlist = this.getPlaylist()
            console.log(playlist);
            this.time = 0
            if ((this.voiceChat.members.size <= 1 && this.t247 == false) || (playlist && playlist.length <= 1)) {
                this.connection.destroy()
                this.deletePlayer();
                this.deletePlaylist();
                return;
            }else {
                var x = playlist
                x.splice(0, 1)
                this.setPlaylist(x)
                this.play()
                return;
            }
        });
        this.player.on('error', (err) => {
            console.log("[MusicPlayer][dispatcher]", err);
            return this.connection.emit("skip")
        });
    }



}


module.exports = MusicPlayer