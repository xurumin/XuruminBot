"use strict";

const {
    createCanvas,
    loadImage,
    registerFont
} = require('canvas');
const Discord = require('discord.js');
const path = require("path");

registerFont(path.join(__dirname,"..",`/files/Arial.ttf`), {family: "arialfont"});

const utils = require('./../../../utils/utils');

require('dotenv/config');

function ImageGenerator(userpic, username) {
    return new Promise(async (resolve, reject) => {
        const canvas = createCanvas(716,399);
        const ctx = canvas.getContext('2d');

        var p1 = {"x":222,"y":187,"width":60,"height":60,"angle":15};
        //var p2 = {"x":262,"y":219,"width":215,"height":215,"angle":10}

        ctx.save();
        ctx.translate(p1.x, p1.y);
        ctx.rotate( utils.angleToRadians(p1.angle) );
        ctx.drawImage(await loadImage(userpic),-p1.width / 2, -p1.height / 2,p1.width,p1.height);
        ctx.restore();

        ctx.drawImage(await loadImage(path.join(__dirname,"..",`/files/licencadepesca/base.png`)), 0, 0, 716,399);

        ctx.save();
        ctx.translate(430, 290);
        ctx.rotate( utils.angleToRadians(8) );
        ctx.font = "20px arialfont";
        ctx.fillText(username, 0, 0);
        ctx.restore();

        resolve(new Discord.MessageAttachment(canvas.toBuffer('image/jpeg', { quality: 0.8 }), 'image.png'));
    });

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
                    utils.createSimpleEmbed(msg.title, msg.description)
                ));
            }
            
            
               

            var name = user.username.slice(0,14);
            ImageGenerator(user_pic, name)
                .then(async (image) => {
                    return resolve(await message.inlineReply(image));
                })
                .catch((err) => {
                    
                    return reject(err);
                });
        });
    },
    get command() {
        return {
            name: 'licencadepesca',
            aliases: [
                "fishinglicense",
                "fishinglicensepatrick"
            ]
        };
    },
};