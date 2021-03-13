const {
    createCanvas,
    loadImage,
    Image
} = require('canvas')
const Discord = require('discord.js');
var videoshow = require('videoshow')
const fs = require('fs');
const path = require("path");
const { randomBytes } = require('crypto');


module.exports = function process(userimagelink, message) {
    return new Promise(async (resolve, reject) => {
        var videoOptions = {
            loop: 1/6,
            transition: false,
            videoBitrate: 100,
            videoCodec: 'libx264',
            size: '250x250',
            audioChannels: 2,
            format: 'mp4',
            pixelFormat: 'yuv420p'
        }

        const audio_path = path.join(__dirname, "..", "/files/catvibing.mp3")

        var images = []

        const canvas = createCanvas(250, 250)
        const ctx = canvas.getContext('2d')
        const user_img = await loadImage(userimagelink)

        for (const img_url of fs.readdirSync(path.join(__dirname, "..", "/files/catgif"))) {
            ctx.clearRect(0,0,250,250)
            ctx.drawImage(user_img, 0, 0, 250,250);
            ctx.drawImage(await loadImage(path.join(__dirname,"..",`/files/catgif/${img_url}`)), 0, 80, 175,175);  

            const random_png_name = randomBytes(5).toString("hex")
            const png_path = path.join(__dirname, "..", `/files/temp/images/${random_png_name}.jpg`)
            await fs.writeFileSync(png_path, canvas.toBuffer('image/jpeg', { quality: 0.5 }))
            images.push(png_path)
            //images.push(path.join(__dirname, "..", `/files/catgif/${img_url}`))
        }
        var d_images = []
        for (let index = 0; index < 4; index++) {
            for(var image of images){
                d_images.push(image)
            }
        }
        
        const random_name = randomBytes(25).toString("hex")
        const video_path = path.join(__dirname, "..", `/files/temp/${random_name}.mp4`)

        var data;
        videoshow(d_images, videoOptions)
            .audio(audio_path)
            .save(video_path)
            .on('error', function (err, stdout, stderr) {
                console.error('Error:', err)
                console.error('ffmpeg stderr:', stderr)
            })
            .on('end', async function (output) {
                resolve([new Discord.MessageAttachment(video_path, 'video.mp4'), {
                    video: video_path,
                    images: images
                }])
                return;
            })

    })

}