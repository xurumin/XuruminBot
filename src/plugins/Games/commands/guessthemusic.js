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
            if (client.playingWITM.has(message.guild.id)) {
                if(args[0]=="-leave"){
                    client.playingWITM.get(message.guild.id).EventEmitter.emit("leave")
                    client.playingWITM.delete(message.guild.id)
                    return message.channel.send(LOCALE["messages"]["leaving"])
                }

                const witm_c = client.playingWITM.get(message.guild.id)
                if (!witm_c.isOpen) return;
                var m_result = witm_c.musicMatch(args.join(" "))
                if (m_result[0] == true) {
                    witm_c.playerGRAnswer(message.author.id)
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
            
            if(args[0]){
                if(args[0] in playlists){
                    game_info.playlist = playlists[args[0]]
                    game_info.genre = args[0]
                }
            }
            
            
            args[1] = parseInt(args[1])


            if(args[1] && Number.isInteger(args[1]) && args[1] <= 15 && args[1] >= 3){
                game_info.rounds = args[1]
            }


            var WITM = new WhatIsTheMusic()

            message.channel.startTyping()
            setTimeout(() => {
                message.channel.stopTyping();
            }, 5000)
            if (!message.member.voice.channel) {
                return message.channel.send(
                    new Discord.MessageEmbed()
                    .setTitle(LOCALE["errors"]["user_is_not_on_voice_chat"].title)
                    .setDescription(LOCALE["errors"]["user_is_not_on_voice_chat"].description)
                )
            }
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
            Utils.Reactions.getConfirmation(start_msg)
                .then(async (code) => {
                    if (client.playingWITM.has(message.guild.id)) {
                        return resolve()
                    }
                    if (!code) {
                        var embed = new Discord.MessageEmbed()
                            .setTitle(LOCALE["messages"]["refused"].title)
                            .setDescription(LOCALE["messages"]["refused"].description)
                        return resolve(await message.channel.send(embed))
                    }

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

                    await Utils.wait(2000)

                    var MusicPlayer = WITM.MusicPlayer()
                    await MusicPlayer.init(message, client)

                    client.playingWITM.set(message.guild.id, WITM)

                    MusicPlayer.checkIfThereArePlayers()
                        .then(() => {
                            message.channel.send(LOCALE["messages"]["leaving"])
                            MusicPlayer.leave()
                            return resolve()
                        })
                    var count = 0;

                    client.playingWITM.set(message.guild.id, WITM)
                    WITM.play_game(MusicPlayer, LOCALE, message, game_info.playlist, () => {
                        message.channel.send(new Discord.MessageEmbed().setTitle(
                            LOCALE["messages"]["playing"].interpolate({
                                index: count + 1
                            })
                        ))
                    })

                    WITM.EventEmitter.on("round", async (res)=>{
                        count += 1
                        if(count >= game_info.rounds){
                            return WITM.EventEmitter.emit("finish")
                        }
                        if (res.status == 0) {
                            await message.channel.send(
                                LOCALE["messages"]["timeout"].interpolate({
                                    music_name: res.music
                                }))
                        }

                        //start another round
                        client.playingWITM.set(message.guild.id, WITM)
                        WITM.play_game(MusicPlayer, LOCALE, message, game_info.playlist, () => {
                            message.channel.send(new Discord.MessageEmbed().setTitle(
                                LOCALE["messages"]["playing"].interpolate({
                                    index: count + 1
                                })
                            ))
                        })
                    })

                    WITM.EventEmitter.on("leave", async ()=>{
                        count = game_info.rounds+5
                        WITM = {}
                        client.playingWITM.delete(message.guild.id)
                        return resolve()
                    })

                    WITM.EventEmitter.on("finish", async ()=>{
                        var leaderboard = WITM.leaderboard.sort().keyArray()
                    

                        var winner_id = leaderboard[leaderboard.length-1]

                        message.channel.send(new Discord.MessageEmbed()
                            .setTitle(
                                LOCALE["messages"]["game_over"].title
                            )
                            .setDescription(
                                LOCALE["messages"]["game_over"].description.interpolate({
                                    points: WITM.leaderboard.get(winner_id),
                                    author: `<@${winner_id}>`,
                                    total: game_info.rounds
                                })
                            ))

                        WITM = {}
                        client.playingWITM.delete(message.guild.id)
                        return resolve()
                    })

                })
                .catch(async (err) => {
                    console.log(err);
                    client.playingWITM.delete(message.guild.id)
                    var embed = new Discord.MessageEmbed()
                        .setTitle(msgs.errors.something_went_wrong.title)
                        .setDescription(msgs.errors.something_went_wrong.description)
                    await message.channel.send(embed)
                    return;
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