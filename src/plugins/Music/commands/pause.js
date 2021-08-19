const Discord = require('discord.js');
const Utils = require("./../../../utils/utils")
const Music = require("./../utils/Music")
const MusicPlayer = require("./../utils/MusicPlayer")
require('dotenv/config');

module.exports = {
    validate(client, message) {
        return true;
    },
    /**
     * @param  {Discord.Client} client
     * @param  {Discord.Message} message
     * @param  {} args
     */
    run: async (client, message, args) => {
        if (!message.member.voice.channel) {
            return message.send_(Utils.createSimpleEmbed("❌ Erro ao executar comando:", `➡️ Você precisa estar em um chat de voz para executar o comando 😉`));
        }
        var player = client.players.get(message.guild.id)
        if (!player) {
            return message.send_(Utils.createSimpleEmbed("❌ Erro ao executar comando:", `➡️ Você precisa estar tocando alguma coisa para executar o comando 😉`));
        }else{
            player.pause()
            return message.send_(Utils.createSimpleEmbed("Música pausada! 🤠", `Use **${process.env.COMMAND_PREFIX}resume** para voltar ao som! 😉`));
        }
    },
    get command() {
        return {
            name: 'pause',
            aliases: ["parar"]
        }
    },
};