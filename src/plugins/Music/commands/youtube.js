const Discord = require('discord.js');
const Utils = require("../../../utils/utils")
const Music = require("../utils/Music")
const MusicPlayer = require("../utils/MusicPlayer")
require('dotenv/config');

module.exports = {
    validate(client, message) {
        if (!message.member.hasPermission('MANAGE_GUILD')) {
            throw new Error('no_permission');
        }
    },
    /**
     * @param  {Discord.Client} client
     * @param  {Discord.Message} message
     * @param  {} args
     */
    run: async (client, message, args) => {
        const playlist_url = args[0]
        if (args.length != 1 || !playlist_url) {
            return message.channel.send(
                Utils.createSimpleEmbed("❌ Erro ao digitar comando:", `➡️ Use  **${process.env.COMMAND_PREFIX}youtube <link da playlist>** para tocar alguma playlist! 🤗`, client.user.username, client.user.avatarURL())
            );
        }
        if (!message.member.voice.channel) {
            return message.channel.send(
                Utils.createSimpleEmbed("❌ Erro ao executar comando:", `➡️ Você precisa estar em um chat de voz para executar o comando 😉`, client.user.username, client.user.avatarURL())
            );
        }
        let youtube_playlist;
        try {
            youtube_playlist = await Music.getYoutubePlaylistByUrl(playlist_url, 50)
        } catch (error) {
            console.log(error)
            return message.channel.send(Utils.createSimpleEmbed("❌ Erro ao executar comando:", `O serviço está temporariamente indisponível 😞\nNossos gatinhos programadores estão fazendo o possível para resolver isso 🤗`, client.user.username, client.user.avatarURL()));
        }
        var player = client.players.get(message.guild.id)
        if (!player) {
            player = await new MusicPlayer(message.guild.id, client, message)
            await player.__connectVoice()
            client.players.set(message.guild.id, player)
            player.setPlaylist(youtube_playlist)
            player.play()
            return message.channel.send(Utils.createSimpleEmbed(`🔊 Tocando ${youtube_playlist[0].name} - ⌛️ ${youtube_playlist[0].duration}`));
        } else {
            player.appendPlaylist(youtube_playlist)
            return message.channel.send(Utils.createSimpleEmbed("✅ Suas músicas foram adicionadas à playlist", `Utilize **${process.env.COMMAND_PREFIX}queue** para ver sua nova playlist! 😉`, client.user.username, client.user.avatarURL()));
        }
    },
    get command() {
        return {
            name: 'youtube',
            aliases: ["yt"]
        }
    },
};