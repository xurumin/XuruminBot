"use strict";

const Discord = require('discord.js');
const Utils = require("./../../../utils/utils")
const WhatIsTheMusic = require("./../utils/guessthemusic/WITM")
const playlists = require("./../files/guessthemusic/playlists.json")
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
    run: async (client, message, args, LOCALE) => {
        return new Promise(async (resolve, reject) => {
            if (!message.member.voice.channel) {
                return message.channel.send(
                    new Discord.MessageEmbed()
                    .setTitle(LOCALE["errors"]["user_is_not_on_voice_chat"].title)
                    .setDescription(LOCALE["errors"]["user_is_not_on_voice_chat"].description)
                )
            }
            if (client.playingWITM.has(message.guild.id)) {
                if(client.playingWITM.get(message.guild.id).isOpen){
                    if (args[0] == "-leave") {
                        client.playingWITM.get(message.guild.id).EventEmitter.emit("leave")
                        return message.channel.send(LOCALE["messages"]["leaving"])
                    }
                    if (args[0] == "-skip") {
                        return client.playingWITM.get(message.guild.id).EventEmitter.emit("round", {
                            status: 0,
                            music: `${client.playingWITM.get(message.guild.id).random_music.name} - ${client.playingWITM.get(message.guild.id).random_music.author}`
                        });
                    }
                }

                if (!client.playingWITM.get(message.guild.id).isOpen) {
                    return message.channel.send(LOCALE["messages"]["there_is_a_game"])
                };

                var m_result = client.playingWITM.get(message.guild.id).musicMatch(args.join(" "))
                if (m_result[0] == true) {
                    client.playingWITM.get(message.guild.id).playerGRAnswer(message.author.id)
                    return;
                } else {
                    message.channel.send(LOCALE["messages"]["accuracy"].interpolate({
                        accuracy: (m_result[1] * 100).toFixed(0),
                        author: message.author
                    }))
                    return;
                }
            }

            var random_genre = Utils.choice(Object.keys(playlists))

            var game_info = {
                rounds: 10,
                playlist: playlists[random_genre],
                genre: random_genre
            }

            if (args[0]) {
                if (args[0].includes("open.spotify.com/playlist/")) {
                    game_info.playlist = args[0]
                    game_info.genre = "playlist"
                } else if (args[0] in playlists) {
                    game_info.playlist = playlists[args[0]]
                    game_info.genre = args[0]
                }
            }

            args[1] = parseInt(args[1])


            if (args[1] && Number.isInteger(args[1]) && args[1] <= 15 && args[1] >= 3) {
                game_info.rounds = args[1]
            }

            message.channel.startTyping()
            setTimeout(() => {
                message.channel.stopTyping();
            }, 5000)

            var msgs = {
                title: LOCALE["messages"].title,
                messages: {
                    start: {
                        description: LOCALE["messages"]["start"].description
                    }
                },
                errors: {
                    something_went_wrong: {
                        title: LOCALE["errors"]["something_went_wrong"].title,
                        description: LOCALE["errors"]["something_went_wrong"].description
                    }
                }
            }
            var start_embed = new Discord.MessageEmbed()
                .setTitle(msgs.title)
                .setDescription(msgs.messages.start.description)
            var start_msg = await message.channel.send(start_embed)
            message.channel.stopTyping();
            Utils.Reactions.getConfirmation(start_msg, message.author.id)
                .then(async (code) => {
                    // if (client.playingWITM.has(message.guild.id) && WITM.state == true) {
                    //     return resolve()
                    // }
                    if (!code) {
                        var embed = new Discord.MessageEmbed()
                            .setTitle(LOCALE["messages"]["refused"].title)
                            .setDescription(LOCALE["messages"]["refused"].description)
                        return resolve(await message.channel.send(embed))
                    }
                    if (client.playingWITM.get(message.guild.id)) {
                        return message.channel.send(LOCALE["messages"]["there_is_a_game"])
                    };

                    client.playingWITM.set(message.guild.id,  new WhatIsTheMusic(client,message, LOCALE))

                    client.playingWITM.get(message.guild.id).state = true;
                    await message.channel.send(
                        new Discord.MessageEmbed()
                        .setTitle(
                            LOCALE["messages"]["about_the_game"].title
                        )
                        .setDescription(
                            LOCALE["messages"]["about_the_game"].description.interpolate({
                                genre: game_info.genre,
                                rounds: game_info.rounds,
                                time: "60s"
                            })
                        )
                    )

                    await Utils.wait(1000)

                    await client.playingWITM.get(message.guild.id).startGame(game_info)

                })
                .catch(async (err) => {
                    console.log(err);
                    client.playingWITM.get(message.guild.id).EventEmitter.emit("leave")
                    var embed = new Discord.MessageEmbed()
                        .setTitle(msgs.errors.something_went_wrong.title)
                        .setDescription(msgs.errors.something_went_wrong.description)
                    await message.channel.send(embed)
                    return resolve();
                })

        })
    },
    get command() {
        return {
            name: 'guessthemusic',
            aliases: [
                "qualamusica",
                "witm",
                "whatisthemusic",
                "gtm"
            ]
        }
    },
};