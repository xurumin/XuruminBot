"use strict";

const {
    createCanvas,
    loadImage
} = require('canvas')
const Discord = require('discord.js');
const path = require("path")
const utils = require('./../../../utils/utils');
const Utils = require("./../../../utils/utils")

const ImageList = require("./../files/outravida/image_list.json")

require('dotenv/config');

function ImageGenerator(user_pic) {
    return new Promise(async (resolve, reject) => {

        const canvas = createCanvas(500,500)
        const ctx = canvas.getContext('2d')

        ctx.drawImage(await loadImage(user_pic), 0,0,500,500);
        ctx.drawImage(await loadImage(path.join(__dirname,"..",`/files/sedutoresdainternet_base.png`)), 0, 0, 500,500);

        resolve(new Discord.MessageAttachment(canvas.toBuffer('image/jpeg', { quality: 0.8 }), 'image.png'))    
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
        return new Promise((resolve, reject) => {

            const tagged_user = message.mentions.users.entries().next()
            var user = message.author
            if (tagged_user.value) user = tagged_user.value[1];

            var user_pic = user.avatarURL({
                format: "png",
                size: 256
            })

            if (!user_pic) {
                var msg = {
                    title: LOCALE.errors.user_do_not_have_pic.title,
                    description: LOCALE.errors.user_do_not_have_pic.description
                }
                return resolve(message.channel.send(
                    Utils.createSimpleEmbed(msg.title, msg.description)
                ));
            }

            message.channel.sendTyping();
            

            ImageGenerator(user_pic, utils.choice(ImageList))
                .then((image) => {
                    var msg = {
                        title: LOCALE.message.title,
                        description: LOCALE.message.description.interpolate({
                            author: message.author
                        })
                    }
                    const embed = new Discord.MessageEmbed()
                        .setColor('#9d65c9')
                        .setTitle(msg.title)
                        .setDescription(msg.description)
                        .attachFiles(image)
                        .setImage("attachment://image.png")
                    
                    return resolve(message.channel.send(embed))

                })
                .catch((err) => {
                    
                    return reject(err)
                })
        })
    },
    get command() {
        return {
            name: 'sedutoresdainternet',
            aliases: [
                "cuidadosedutores"
            ]
        }
    },
};