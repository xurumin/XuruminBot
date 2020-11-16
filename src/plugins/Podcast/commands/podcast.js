const Discord = require('discord.js');
const PodcastUtil = require('../utils/PodcastUtil');
const Utils = require("./../../../utils/utils")
const MusicPlayer = require("./../../Music/utils/MusicPlayer")
require('dotenv/config');

var userMsg;

/**
* @param  {Discord.Client} client
* @param  {Discord.Message} message
*/
async function showLastsEps(podcastUrl, podcastName,podcastAuthor, client, message, index=0) {
    const lastEps = await PodcastUtil.getLastEpsByUrl(podcastUrl, index)
    let messageBody = new Discord.MessageEmbed();
    messageBody.setTitle(`Últimos podcasts de ${podcastName}`)
    messageBody.setAuthor(client.user.username)
    messageBody.setColor('#9d65c9')
    messageBody.setThumbnail(client.user.avatarURL())
    messageBody.setFooter("🔔 Clique no número abaixo para retornar ouvir o epsódio")
    let i = 0;
    let searchlist = lastEps.map((element) => {
        i+=1;
        messageBody.addField(`${i}: ${element["title"][0]}`, podcastName)
        return {
            url:element["enclosure"][0]["$"]["url"],
            title: element["title"][0],
            duration: element["itunes:duration"][0]
        }
    });
    
    let sMsg = await message.edit(messageBody)

    PodcastUtil.getReact(sMsg)
    .then(async (i)=>{
        if(i == 5){
            if(index==0) return message.edit(new Discord.MessageEmbed().setTitle("Desculpe, mas só achei esses epsódios 😥"));
            return showLastsEps(podcastUrl, podcastName, podcastAuthor, client, message, index-5)
        }else if(i == 6){
            return showLastsEps(podcastUrl, podcastName, podcastAuthor, client, message, index+5)
        }else if(i > 6){
            return message.edit(new Discord.MessageEmbed().setTitle("Desculpe, mas só achei esses epsódios 😥"));
        }else{
            if (!userMsg.member.voice.channel) {
                return message.edit(new Discord.MessageEmbed().setTitle("Você precisa estar em um chat de voz para executar o comando 😥"));
            }

            let player = await new MusicPlayer(userMsg.guild.id, client, userMsg)
            await player.__connectVoice()
            client.players.set(message.guild.id, player)
            const podcastEpisode = searchlist[i]
            let podcastInfo = {
                name: podcastEpisode.title,
                url: podcastEpisode.url,
                author: podcastAuthor,
                duration: podcastEpisode.duration
            }
            player.setPlaylist([podcastInfo])
            player.playMp3()
            return message.edit(Utils.createSimpleEmbed(`🔊 Tocando ${podcastInfo.name} - ⌛️ ${podcastInfo.duration}`));
        }
    })
    
}

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
        userMsg = message;
        const searchTerm = args.join(" ")
        if (!searchTerm) {
            return message.channel.send(
                Utils.createSimpleEmbed("❌ Erro ao digitar comando:", `➡️ Use  **${process.env.COMMAND_PREFIX}podcast <nome do podcast>** para tocar alguma coisa! 🤗`, client.user.username, client.user.avatarURL())
            );
        }
        if (!message.member.voice.channel) {
            return message.channel.send(
                Utils.createSimpleEmbed("❌ Erro ao executar comando:", `➡️ Você precisa estar em um chat de voz para executar o comando 😉`, client.user.username, client.user.avatarURL())
            );
        }

        let data = await PodcastUtil.getPodcastsByTerm(searchTerm);

        let messageBody = new Discord.MessageEmbed();
        messageBody.setTitle("Podcats - Resultado da sua pesquisa")
        messageBody.setAuthor(client.user.username)
        messageBody.setColor('#9d65c9')
        messageBody.setThumbnail(client.user.avatarURL())
        messageBody.setFooter("🔔 Clique no número abaixo para retornar os ultimos epsódios")
        let i = 0;
        let searchlist = data.map((element) => {
            messageBody.addField(`${i+1}: ${element["trackName"]}`, `${element["artistName"]}`)
            i += 1;
            return {
                name: element["trackName"],
                url: element["feedUrl"],
                author: element["artistName"]
            }
        })

        let sMsg = await message.channel.send(messageBody)

        PodcastUtil.getReactLight(sMsg)
            .then(index => {
                if(index > 5 || index > searchlist.length-1){
                    return sMsg.edit("Desculpe, mas só achei esses epsódios 😥");
                }
                return showLastsEps(searchlist[index].url, searchlist[index].name, searchlist[index].author, client, sMsg, 0)
            }).catch(err => {
                if(err["message"]){
                    err["message"].reactions.removeAll()
                    return err["message"].edit("Desculpe, mas só achei esses epsódios 😥");
                }else{
                    return err;
                }
            })
    },
    get command() {
        return {
            name: 'podcast',
            aliases: ["pdc"]
        }
    },
};