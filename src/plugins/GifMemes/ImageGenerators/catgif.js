const {
	createCanvas,
    loadImage,
    Image
} = require('canvas')
const Discord = require('discord.js');

const GIFEncoder = require('gifencoder');

const fs = require('fs');



module.exports = function process(userimagelink, message) {
    return new Promise(async (resolve, reject) => {
        const encoder = new GIFEncoder(250, 250);
        var data = [];
        encoder.createReadStream()
        .on("data", (chunk)=>{
            data.push(chunk)
        })
        .on("end", ()=>{
            return resolve(new Discord.MessageAttachment(Buffer.concat(data), 'image.gif'))
        })

        encoder.start();
        encoder.setRepeat(0);   // 0 for repeat, -1 for no-repeat
        encoder.setDelay(150);  // frame delay in ms
        encoder.setQuality(10); // image quality. 10 is default.
        

        const canvas = createCanvas(250, 250)
        const ctx = canvas.getContext('2d')
        

        const user_img = await loadImage(userimagelink)


        for (const img_url of fs.readdirSync(__dirname+"/files/pngs")) {
            ctx.drawImage(user_img, 0, 0, 250,250);
            ctx.drawImage(await loadImage(`${__dirname}/files/pngs/${img_url}`), 0, 80, 175,175);
            encoder.addFrame(ctx);
        }

        encoder.finish()
        
    })

}