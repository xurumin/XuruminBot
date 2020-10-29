const {
	createCanvas,
    loadImage,
    Image
} = require('canvas')
const Discord = require('discord.js');
const GIFEncoder = require('gif-encoder-2');


const fs = require('fs');



module.exports = function process(userimagelink, message) {
    return new Promise(async (resolve, reject) => {

        let encoder = new GIFEncoder(500, 500);
        encoder.setQuality(100)
        encoder.setDelay(80)
        encoder.start()
        const canvas = createCanvas(500, 500)
        const ctx = canvas.getContext('2d')

        const user_img = await loadImage(userimagelink)

        for (const img_url of fs.readdirSync(__dirname+"/files/pngs")) {
            ctx.drawImage(user_img, 0, 0, 500,500);
            ctx.drawImage(await loadImage(`${__dirname}/files/pngs/${img_url}`), 0, 160, 350,350);
            encoder.addFrame(ctx)
        }
        encoder.finish()
        const buffer = encoder.out.getData()
        return resolve(new Discord.MessageAttachment(buffer, 'image.gif'))
    })

}