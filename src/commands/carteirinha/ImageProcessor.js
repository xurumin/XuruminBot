const {
	createCanvas,
	loadImage
} = require('canvas')
const fs = require("fs-extra")
const Discord = require('discord.js');


module.exports = function process(user_img, username, roles, cateirinha_tag) {
    return new Promise(async (resolve, reject) => {
        const canvas = createCanvas(485, 300)
        const ctx = canvas.getContext('2d')


        
        ctx.drawImage(await loadImage(__dirname + `/base.png`),0, 0, 485,300);
        ctx.drawImage(await loadImage(user_img), 18, 58, 137,185);

        ctx.font = "700 22px Arial";
        ctx.textAlign = "left";
        ctx.fillStyle = "BLACK";
        ctx.fillText(`Carteira de ${cateirinha_tag}`, 173, 90)
        ctx.font = "20px Arial";
        ctx.fillText(username, 175, 118)
        ctx.font = "14px Arial";
        ctx.fillStyle = "#242424";
        ctx.fillText(roles[0], 175, 140)
        ctx.fillText(roles[1], 175, 155)
        ctx.fillText(roles[2], 175, 170)
        
        resolve(new Discord.MessageAttachment(canvas.toBuffer(), 'image.png'))
    })

}