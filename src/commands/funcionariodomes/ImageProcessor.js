const {
	createCanvas,
	loadImage
} = require('canvas')
const fs = require("fs-extra")
const Discord = require('discord.js');


module.exports = function process(user_img) {
    return new Promise(async (resolve, reject) => {
        const canvas = createCanvas(400, 400)
        const ctx = canvas.getContext('2d')

        ctx.drawImage(await loadImage(user_img), 0, 0,293,400);
        ctx.drawImage(await loadImage(__dirname + `/funcionariodomes1.png`), 0, 0,293,400);
        
        
        resolve(new Discord.MessageAttachment(canvas.toBuffer('image/jpeg', { quality: 0.8 }), 'image.png'))   
    })

}