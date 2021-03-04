"use strict";

const {
    createCanvas,
    loadImage
} = require('canvas')
const Discord = require('discord.js');
const path = require("path");
const utils = require('./../../../utils/utils');

require('dotenv/config');

function ImageGenerator(usersPic) {
    return new Promise(async (resolve, reject) => {
        const pos = {
            bolsonaro: {"x":184,"y":71,"width":120,"height":120,"angle":5},
            maria: {"x":459,"y":116,"width":60,"height":80,"angle":-8},
            randomWoman: {"x":401,"y":139,"width":50,"height":50,"angle":5}
        }
        const canvas = createCanvas(640,300)
        const ctx = canvas.getContext('2d')


        ctx.save()
        ctx.translate(pos.bolsonaro.x, pos.bolsonaro.y);
        ctx.rotate( utils.angleToRadians(pos.bolsonaro.angle) );
        ctx.drawImage(await loadImage(usersPic[0]),-pos.bolsonaro.width / 2, -pos.bolsonaro.height / 2, pos.bolsonaro.width,pos.bolsonaro.height);
        ctx.restore()

        ctx.save()
        ctx.translate(pos.maria.x, pos.maria.y);
        ctx.rotate( utils.angleToRadians(pos.maria.angle) );
        ctx.drawImage(await loadImage(usersPic[1]),-pos.maria.width / 2, -pos.maria.height / 2, pos.maria.width,pos.maria.height);
        ctx.restore()

        ctx.save()
        ctx.translate(pos.randomWoman.x, pos.randomWoman.y);
        ctx.rotate( utils.angleToRadians(pos.randomWoman.angle) );
        ctx.drawImage(await loadImage(usersPic[2]),-pos.randomWoman.width / 2, -pos.randomWoman.height / 2, pos.randomWoman.width,pos.randomWoman.height);
        ctx.restore()

        ctx.drawImage(await loadImage(path.join(__dirname,"..",`/files/daqueeutedououtra/base.png`)), 0, 0, 640,300);

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
            const tagged_users = message.mentions.users.array()
            var userImages = []

            if(tagged_users.length <2){
                var msg = {
                    title: LOCALE.errors["need_more_users"].title,
                    description: LOCALE.errors["need_more_users"].description
                }
                return resolve(message.channel.send(
                    utils.createSimpleEmbed(msg.title, msg.description)
                ));
            }
            for(var user of tagged_users.slice(0,3)){
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
                        utils.createSimpleEmbed(msg.title, msg.description)
                    ));
                }
                userImages.push(user_pic)
            }

            if (tagged_users.length==2){
                var user_pic = client.user.avatarURL({
                    format: "png",
                    size: 256
                })
                userImages.push(user_pic)
            }
            

            message.channel.startTyping()
            setTimeout(() => {
                message.channel.stopTyping();
            }, 5000);


            ImageGenerator(userImages)
                .then(async (image) => {
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
                    message.channel.stopTyping()    

                    return resolve(await message.channel.send(embed))
                })
                .catch((err) => {
                    message.channel.stopTyping()
                    return reject(err)
                })
        })
    },
    get command() {
        return {
            name: 'daqueeutedououtra',
            aliase: [
                "dqetdo"
            ]
        }
    },
};