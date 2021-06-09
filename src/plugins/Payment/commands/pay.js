"use strict";
const Discord = require('discord.js');
const Payment = require("./../../../libs/Payment")
const Utils = require("./../../../utils/utils")
require('dotenv/config');

function getUserFromMention(mention) {
    if (!mention) return;

    if (mention.startsWith('<@') && mention.endsWith('>')) {
        mention = mention.slice(2, -1);

        if (mention.startsWith('!') || mention.startsWith('&')) {
            mention = mention.slice(1);
        }

        return mention;
    }
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
        return new Promise(async (resolve, reject) => {
            if (!args[0] || !args[1]) {
                return message.channel.send(
                    Utils.createSimpleEmbed(LOCALE.errors.cmd_format.title, LOCALE.errors.cmd_format.description.interpolate({
                        prefix: process.env.COMMAND_PREFIX
                    }), client.user.username)
                );
            }
            const taggedUser = client.users.cache.get(getUserFromMention(args[0]))

            if (!taggedUser) {
                return message.channel.send(
                    Utils.createSimpleEmbed(LOCALE.errors.user_not_found.title, LOCALE.errors.user_not_found.description.interpolate({
                        prefix: process.env.COMMAND_PREFIX
                    }), client.user.username)
                );
            }
            const paymentInfo = {
                payerId: message.author.id,
                payeeId: taggedUser.id,
                value: parseFloat(args[1])
            }
            if (!(await Payment.userHasFunds(paymentInfo.payerId, paymentInfo.value))) {
                return message.channel.send(
                    Utils.createSimpleEmbed(LOCALE.errors.user_do_not_have_funds.title, LOCALE.errors.user_do_not_have_funds.description.interpolate({
                        prefix: process.env.COMMAND_PREFIX
                    }), client.user.username)
                );
            }


            var confirmation_msg = {
                title: LOCALE["confirmation"][0].title,
                description: LOCALE["confirmation"][0].description
            }
            var operation_refused_msg = {
                title: LOCALE["confirmation"][1].title
            }
            var msg = await message.channel.send(Utils.createSimpleEmbed(confirmation_msg.title,confirmation_msg.description))
            Utils.Reactions.getConfirmation(
                msg, message.author.id
            ).then(async (value)=>{
                await msg.delete()
                if(!value){
                    return await message.channel.send(Utils.createSimpleEmbed(operation_refused_msg.title,""))
                }
                Payment.pay(paymentInfo.payerId, paymentInfo.payeeId, paymentInfo.value)
                .then(pmtResponse => {
                    message.author.send(LOCALE.pv_message.interpolate({
                        transaction_id: pmtResponse.id,
                        creation_time: pmtResponse.create_time,
                        payer: pmtResponse.payerId,
                        payee: pmtResponse.payeeId,
                        value: pmtResponse.value,
                    }))
                    taggedUser.send(LOCALE.pv_message.interpolate({
                        transaction_id: pmtResponse.id,
                        creation_time: pmtResponse.create_time,
                        payer: pmtResponse.payerId,
                        payee: pmtResponse.payeeId,
                        value: pmtResponse.value,
                    }))
                    return message.channel.send(
                        Utils.createSimpleEmbed(LOCALE.message.title, LOCALE.message.description.interpolate({
                            prefix: process.env.COMMAND_PREFIX
                        }), client.user.username)
                    );
                })
                .catch(error => {
                    if (error.code) {
                        return message.channel.send(
                            Utils.createSimpleEmbed(LOCALE.errors.invalid_value.title, LOCALE.errors.invalid_value.description.interpolate({
                                prefix: process.env.COMMAND_PREFIX
                            }), client.user.username)
                        );
                    }
                    return reject(error);
                })
            })
            .catch(async (err)=>{
                console.log(err);
                return await message.channel.send(Utils.createSimpleEmbed(operation_refused_msg.title,""))
            })
        })
    },
    get command() {
        return {
            name: 'pay',
            aliases: [
                "pagar"
            ]
        }
    },
};