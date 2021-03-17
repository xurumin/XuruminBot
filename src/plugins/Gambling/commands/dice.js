"use strict";

const Discord = require('discord.js');
const Utils = require("./../../../utils/utils")
const Payment = require("./../../../libs/Payment")
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
            var game_info = {
                title: LOCALE.title,
                play: {
                    value: parseInt(args[0]),
                    face: parseInt(args[1])
                }
            }

            if (!game_info.play.value || !game_info.play.face || game_info.play.value <= 0 || game_info.play.face <= 0 || game_info.play.face > 6) {
                return message.channel.send(new Discord.MessageEmbed().setDescription(LOCALE["start"].description.interpolate({
                        user: message.author,
                        prefix: process.env.COMMAND_PREFIX
                    }))
                    .setTitle(game_info.title))
            }
            var embed = new Discord.MessageEmbed()
            .setTitle(LOCALE["confirmation"].title)
            .setDescription(LOCALE["confirmation"].description.interpolate({
                value: game_info.play.value,
                face: game_info.play.face
            }))
            var confirmation = await message.channel.send(embed)

            Utils.Reactions.getConfirmation(confirmation, message.author.id)
                .then(async (status) => {
                    if (!status) {
                        return resolve(await message.channel.send(LOCALE["refused"]))
                    }
                    Payment.fastPay(message.author.id, game_info.play.value)
                        .then(async (pmtResponse) => {
                            embed.setTitle(LOCALE["loading"].title)
                            embed.setDescription(LOCALE["loading"].description)
                            confirmation.edit(embed)
                            await Utils.wait(3000)

                            embed.setTitle(game_info.title)

                            var random = Utils.random(1,6)

                            if(random == game_info.play.face){
                                var prize = game_info.play.value * Utils.randomFloat(1.01, 1.5).toFixed(1)
                                embed.setDescription(LOCALE["player_won"].interpolate({
                                    prize: prize
                                }))
                                await Payment.fastPayXurumin(message.author.id, prize)
                                return resolve(confirmation.edit(embed))
                            }else{
                                embed.setDescription(Utils.choice(LOCALE["player_lost"]).interpolate({
                                    prize: prize,
                                    face: random
                                }))
                                return resolve(confirmation.edit(embed))
                            }

                        }).catch(async (err) => {
                            embed.setTitle(LOCALE["user_do_not_have_funds"].title)
                            embed.setDescription(LOCALE["user_do_not_have_funds"].description.interpolate({
                                user: message.author,
                                prefix: process.env.COMMAND_PREFIX
                            }))
                            return resolve(await confirmation.edit(embed))
                        })
                })
                .catch(async (err) => {
                    await message.channel.send(LOCALE["standard_error"])
                    return reject(err)
                })
        })
    },
    get command() {
        return {
            name: 'dice',
            aliases: [
                "jogardado",
                "lancardado",
                "rollthedice"
            ]
        }
    },
};