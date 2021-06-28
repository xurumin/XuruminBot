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
            return message.channel.send(Utils.createSimpleEmbed("❌ Erro ao executar comando:", `➡️ Você precisa estar em um chat de voz para executar o comando 😉`));
        }
        var player = client.players.get(message.guild.id)
        if (!player) {
            return message.channel.send(Utils.createSimpleEmbed("❌ Erro ao executar comando:", `➡️ Você precisa estar tocando alguma coisa para executar o comando 😉`));
        }else{
            player.resume()
            return message.channel.send(Utils.createSimpleEmbed("Voltando a tocar! 🤠", ""));
        }
    },
    get command() {
        return {
            name: 'resume',
            aliases: ["retomar", "voltar"]
        }
    },
};