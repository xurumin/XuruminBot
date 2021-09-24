"use strict";

const Discord = require('discord.js');
const Utils = require("./../../../utils/utils");
const fs = require("fs");
const {
    default: axios
} = require('axios');

module.exports = {
    validate(client, message) {
        return true;
    },
    /**
     * @param  {Discord.Client} client
     * @param  {Discord.Message} message
     * @param  {} args
     */
    run: (client, message, args, LOCALE) => {
       return new Promise(async (resolve, reject)=>{
        const isPremium = await Utils.Profile.isPremium(client, message.author.id);
        if (!isPremium) {
            const notPremiumEmbed = new Discord.MessageEmbed()
                .setColor('#9d65c9')
                .setTitle(LOCALE.errors.user_is_not_premium.title)
                .setDescription(LOCALE.errors.user_is_not_premium.description.interpolate({
                    prefix: process.env.COMMAND_PREFIX
                }));
            return resolve(message.send_(notPremiumEmbed));
        }
        const tagged_user = message.mentions.users.entries().next();
        var user = message.author;
        if (tagged_user.value) user = tagged_user.value[1];
        var user_pic = user.avatarURL({
            format: "png",
            size: 256
        });
        if (!user_pic) {
            var msg = {
                title: LOCALE.errors.user_do_not_have_pic.title,
                description: LOCALE.errors.user_do_not_have_pic.description
            };
            return resolve(message.send_(
                Utils.createSimpleEmbed(msg.title, msg.description)
            ));
        }
        const embed = new Discord.MessageEmbed()
            .setColor('#9d65c9')
            .setTitle(LOCALE.messages.loading.title)
            .setDescription(LOCALE.messages.loading.description);

        var loading_msg = await message.send_(embed);

        axios.get(`${process.env.KARINNA_API_PATH}/v1/gif/catgif`, {
            headers: {
                authorization: process.env.KARINNA_API_TOKEN
            },
            params: {
                img_url: user_pic
            },
            timeout: 60 * 1000,
            responseType: "arraybuffer"
        }).then(async (res) => {
            loading_msg.delete();
            return resolve(await message.send_(new Discord.MessageAttachment(res.data, 'xurumin.gif')));
        }).catch(async (err) => {
            loading_msg.delete();
            console.log(err);
            resolve(message.send_(new Discord.MessageEmbed()
                .setTitle(LOCALE.errors.cmd_run_error.title)
                .setDescription(LOCALE.errors.cmd_run_error.description))
            );
        });
       });
    },
    get command() {
        return {
            name: 'catgif'
        };
    },
};