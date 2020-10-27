const Discord = require('discord.js');
const Utils = require("./../../../utils/utils")
const Music = require("./../utils/Music")
const MusicPlayer = require("./../utils/MusicPlayer")
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
        const video_url = args[0]
        if (args.length != 1 || !video_url) {
            return message.channel.send(
                Utils.createSimpleEmbed("❌ Erro ao digitar comando:", `➡️ Use  **${process.env.COMMAND_PREFIX}play <link do youtube>** para tocar alguma coisa! 🤗`, client.user.username, client.user.avatarURL())
            );
        }
        if (!message.member.voice.channel) {
            return message.channel.send(
                Utils.createSimpleEmbed("❌ Erro ao executar comando:", `➡️ Você precisa estar em um chat de voz para executar o comando 😉`, client.user.username, client.user.avatarURL())
            );
        }
        try {
            var video_info = await Music.getVideoInfoByUrl(video_url)
        } catch (error) {
            console.log(">", error)
            return message.channel.send(Utils.createSimpleEmbed("❌ Erro ao executar comando:", `O serviço está temporariamente indisponível 😞\nNossos gatinhos programadores estão fazendo o possível para resolver isso 🤗`, client.user.username, client.user.avatarURL()));
        }
        var player = client.players.get(message.guild.id)
        if (!player) {
            player = await new MusicPlayer(message.guild.id, client, message)
            await player.__connectVoice()
            client.players.set(message.guild.id, player)
            player.setPlaylist([video_info])
            player.play()
            return message.channel.send(Utils.createSimpleEmbed(`🔊 Tocando ${video_info.name} - ⌛️ ${video_info.duration}`));
        }else{
            player.appendPlaylist([video_info])
            return message.channel.send(Utils.createSimpleEmbed("✅ Sua música foi adicionada à playlist", `Utilize **${process.env.COMMAND_PREFIX}queue** para ver sua nova playlist! 😉`, client.user.username, client.user.avatarURL()));
        }
    },
    get command() {
        return {
            name: 'play'
        }
    },
};