"use strict";

const {
    createCanvas,
    loadImage
} = require('canvas')
const Discord = require('discord.js');
const path = require("path");
const utils = require('./../../../utils/utils');
const Utils = require("./../../../utils/utils")

const ImageList = require("./../files/outravida/image_list.json")

require('dotenv/config');

function ImageGenerator(user_pic) {
    return new Promise(async (resolve, reject) => {
        const canvas = createCanvas(500,500)
        const ctx = canvas.getContext('2d')

        ctx.drawImage(await loadImage(user_pic), 0,0,500,500);
        ctx.drawImage(await loadImage(path.join(__dirname,"..",`/files/humorkkjkk_base.png`)), 0, 0, 500,500);

        ctx.globalCompositeOperation = "saturation";
        ctx.fillStyle = "hsl(0,100%,50%)";  // saturation at 100%
        ctx.fillRect(0,0,500,500);  // apply the comp filter
        ctx.globalCompositeOperation = "source-over";  // restore default comp

        ctx.fillStyle = "rgba(255, 0, 0,0.1)"
        ctx.fillRect(0,0,500,500);        

        resolve(new Discord.MessageAttachment(canvas.toBuffer('image/jpeg', { quality: 0.5 }), 'image.png'))
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
                return resolve(message.send_(
                    Utils.createSimpleEmbed(msg.title, msg.description)
                ));
            }

            message.channel.sendTyping();
            

            ImageGenerator(user_pic, utils.choice(ImageList))
                .then(async (image) => {
                        return resolve(await message.inlineReply(image))
                })
                .catch((err) => {
                    
                    return reject(err)
                })
        })
    },
    get command() {
        return {
            name: 'humorkkjkk',
            aliases: [
                "humorepiadas"
            ]
        }
    },
};