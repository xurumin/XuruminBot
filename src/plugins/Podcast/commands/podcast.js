const Discord = require('discord.js');
const Music = require('../../Music/utils/Music');
const PodcastUtil = require('../utils/PodcastUtil');
const Utils = require("./../../../utils/utils")
const MusicPlayer = require("./../../Music/utils/MusicPlayer")
const url = require("url")
require('dotenv/config');

var userMsg;

/**
 * @param  {Discord.Client} client
 * @param  {Discord.Message} message
 */
async function showLastsEps(podcastUrl, podcastName, podcastAuthor, client, message, index = 0) {
    const lastEps = await PodcastUtil.getLastEpsByUrl(podcastUrl, index)
    let messageBody = new Discord.MessageEmbed();
    messageBody.setTitle(`Últimos podcasts de ${podcastName}`)
    messageBody.setAuthor(client.user.username)
    messageBody.setColor('#9d65c9')
    messageBody.setThumbnail(client.user.avatarURL())
    messageBody.setFooter("🔔 Clique no número abaixo para retornar ouvir o epsódio")
    let i = 0;
    let searchlist = lastEps.map((element) => {
        i += 1;
        messageBody.addField(`${i}: ${element["title"][0]}`, podcastName)
        return {
            url: element["enclosure"][0]["$"]["url"],
            title: element["title"][0],
            duration: element["itunes:duration"][0]
        }
    });

    let sMsg = await message.edit(messageBody)

    PodcastUtil.getReact(sMsg)
        .then(async (i) => {
            if (i == 5) {
                if (index == 0) return message.edit(new Discord.MessageEmbed().setTitle("Desculpe, mas só achei esses epsódios 😥"));
                return showLastsEps(podcastUrl, podcastName, podcastAuthor, client, message, index - 5)
            } else if (i == 6) {
                return showLastsEps(podcastUrl, podcastName, podcastAuthor, client, message, index + 5)
            } else if (i > 6) {
                return message.edit(new Discord.MessageEmbed().setTitle("Desculpe, mas só achei esses epsódios 😥"));
            } else {
                if (!userMsg.member.voice.channel) {
                    return message.edit(new Discord.MessageEmbed().setTitle("Você precisa estar em um chat de voz para executar o comando 😥"));
                }

                let player = await new MusicPlayer(userMsg.guild.id, client, userMsg, "mp3")
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
    run: async (client, message, args, LOCALE) => {
        userMsg = message;
        const searchTerm = args.join(" ")
        if (!searchTerm) {
            return message.channel.send(
                Utils.createSimpleEmbed("❌ Erro ao digitar comando:", `➡️ Use  **${process.env.COMMAND_PREFIX}podcast <nome do podcast>** para tocar alguma coisa! 🤗`)
            );
        }
        if (!message.member.voice.channel) {
            return message.channel.send(
                Utils.createSimpleEmbed("❌ Erro ao executar comando:", `➡️ Você precisa estar em um chat de voz para executar o comando 😉`)
            );
        }

        const url_ = url.parse(searchTerm).host
        if (searchTerm.includes("open.spotify.com/episode/") && url_.includes("open.spotify.com")) {
            var podcastShow;
            var podcastEp;
            try {
                podcastEp = await Music.getSpotifyPodcastEp(searchTerm)
                podcastShow = await PodcastUtil.getPodcastsByTerm(podcastEp["show_name"])
                podcastShow = podcastShow.find(ep=>{
                    return ep.kind == "podcast" && ep.artistName == podcastEp["publisher"] && ep.trackName == podcastEp["show_name"]
                })

                if(!podcastShow){
                    return message.channel.send(new Discord.MessageEmbed().setDescription("Oops! Não achei nenhum podcast com esse nome.\nTente procurar o **nome** do podcast :)"))
                }

                var eps = await PodcastUtil.getLastEpsByUrl(podcastShow["feedUrl"], 0, 5000)
                var episodeF = eps.find(ep=>{
                    return (String(ep["title"][0]).toLowerCase() == String(podcastEp["name"]).toLowerCase()) || String(ep["itunes:title"]).toLowerCase() == String(podcastEp["name"]).toLowerCase()
                })
                if(!episodeF){
                    return message.channel.send(new Discord.MessageEmbed().setDescription("Oops! Não achei nenhum podcast com esse nome.\nTente procurar o **nome** do podcast :)"))
                }
                podcastEp.url = episodeF["enclosure"][0]["$"]["url"]

            } catch (error) {
                console.log(error);
                return message.channel.send(Utils.createSimpleEmbed(LOCALE["errors"]["cmd_run_error"].title, LOCALE["errors"]["cmd_run_error"].description));
            }
            var player = client.players.get(message.guild.id)
            if (!player) {
                player = await new MusicPlayer(message.guild.id, client, message, "mp3")
                await player.__connectVoice()
                client.players.set(message.guild.id, player)
                player.setPlaylist([podcastEp])
                player.playMp3()
                return message.channel.send(Utils.createSimpleEmbed(LOCALE["playing"].interpolate({
                    title: podcastEp.name,
                    duration: podcastEp.duration
                })));
            } else {
                player.appendPlaylist([podcastEp])
                return message.channel.send(Utils.createSimpleEmbed(LOCALE["podcast_added"].title, LOCALE["podcast_added"].description.interpolate({
                    prefix: process.env.COMMAND_PREFIX
                })));
            }
        }

        let data = await PodcastUtil.getPodcastsByTerm(searchTerm);

        if (data.length <= 0) {
            if (args[0].includes("open.spotify.com/show/")) {
                return message.channel.send("Hey! Tente procurar o **nome** do podcast :) ")
            }
            return message.channel.send("Oops! Não achei nenhum podcast com esse nome.\nVerifique se você escreveu o nome corretamente.")
        }

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
                if (index > 5 || index > searchlist.length - 1) {
                    return sMsg.edit("Desculpe, mas só achei esses epsódios 😥");
                }
                return showLastsEps(searchlist[index].url, searchlist[index].name, searchlist[index].author, client, sMsg, 0)
            }).catch(err => {
                if (err["message"]) {
                    //err["message"].reactions.removeAll()
                    return err["message"].edit("Desculpe, mas só achei esses epsódios 😥");
                } else {
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