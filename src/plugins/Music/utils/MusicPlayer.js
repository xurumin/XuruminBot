const Discord = require('discord.js');
const Utils = require("./../../../utils/utils")
const Music = require("./../utils/Music")
const urlQ = require("url")
// const ytdl = require("ytdl-core")
const ytdl = require("./../../../libs/ytdl-temp/lib/index")


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
        this.client.playlist.set(this.guild_id, this.getPlaylist().concat(playlist).slice(0,100))
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
    getStreamTime(){
        return this.dispatcher.streamTime
    }
    getTotalTime(){
        return Utils.hmsToSeconds(this.getPlaylist()[0].duration)*1000 || 0
    }

    aliveConCooldown(){
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
                this.message.channel.send(Utils.createSimpleEmbed("❌ Erro ao executar comando:", `O bot não possui as permissões para executar o comando 😞`, this.client.user.username, this.client.user.avatarURL()));
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
                return this.message.channel.send(Utils.createSimpleEmbed("Saindo... Até mais! 😁"));
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
                return this.message.channel.send(Utils.createSimpleEmbed("Saindo... Até mais! 😁"));
            }else{
                return;
            }
        })


        this.connection.on('play', async () => {
            this.isPlaying == true
            if (this.dispatcher) this.dispatcher.destroy();
            var current_playlist = this.getPlaylist()
            if (!current_playlist) return this.message.channel.send(Utils.createSimpleEmbed("❌ Erro ao digitar comando:", `➡️ Use  **${process.env.COMMAND_PREFIX}play <link do youtube>** para tocar alguma coisa! 🤗`, this.client.user.username, this.client.user.avatarURL()));

            let music_url;

            try {
                if(current_playlist[0]["url"]){
                    music_url = current_playlist[0]["url"]
                }else{
                    music_url = await Music.getVideoLinkBySearch(current_playlist[0]["name"] + " " + current_playlist[0]["author"])
                }

                // console.log(current_playlist[0]["name"], music_url);

                const stream = ytdl(music_url, {
                    filter: 'audioonly',
                    quality: this.audioquality
                });
                
                this.dispatcher = await this.connection.play(stream,
                    {
                        seek: current_playlist[0].time || 0
                    }
                )

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
            if (!current_playlist) return this.message.channel.send(Utils.createSimpleEmbed("❌ Erro ao digitar comando:", `➡️ Use  **${process.env.COMMAND_PREFIX}play <link do youtube>** para tocar alguma coisa! 🤗`, this.client.user.username, this.client.user.avatarURL()));

            let music_url;

            try {
                if(current_playlist[0]["url"]){
                    music_url = current_playlist[0]["url"]
                }else{
                    music_url = await Music.getVideoLinkBySearch(current_playlist[0]["name"] + " " + current_playlist[0]["author"])
                }

                this.dispatcher = await this.connection.play(music_url,
                    {
                        seek: current_playlist[0].time || 0
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
            if (this.connection.channel.members.size <= 1) {
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