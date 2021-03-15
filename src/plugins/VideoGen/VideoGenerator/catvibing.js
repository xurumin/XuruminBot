const {
    createCanvas,
    loadImage,
    Image
} = require('canvas')
const Discord = require('discord.js');

var pathToFfmpeg = require('ffmpeg-static');
var ffprobeStatic = require('ffprobe-static');

var videoshow = require('videoshow')
videoshow.ffmpeg.setFfmpegPath(pathToFfmpeg)
videoshow.ffmpeg.setFfprobePath(ffprobeStatic.path)

const fs = require('fs');
const path = require("path");
const { randomBytes } = require('crypto');


module.exports = function process(userimagelink, message) {
    return new Promise(async (resolve, reject) => {

        var video_info = {
            width: 250,
            height: 250
        }
        var videoOptions = {
            loop: 1/6,
            flags:["-threads 1"],
            transition: false,
            videoBitrate: 200,
            videoCodec: 'libx264',
            size: `${video_info.width}x${video_info.height}`,
            audioChannels: 2,
            format: 'mp4',
            pixelFormat: 'yuv420p'
        }

        const audio_path = path.join(__dirname, "..", "/files/catvibing.mp3")

        var images = []

        const canvas = createCanvas(video_info.width,video_info.height)
        const ctx = canvas.getContext('2d')
        const user_img = await loadImage(userimagelink)

        for (const img_url of fs.readdirSync(path.join(__dirname, "..", "/files/catvibing"))) {
            ctx.clearRect(0,0,video_info.width,video_info.height)
            ctx.drawImage(user_img, 0, 0, video_info.width,video_info.height);
            ctx.drawImage(await loadImage(path.join(__dirname,"..",`/files/catvibing/${img_url}`)), 0, 0.32 * video_info.height, 0.7 * video_info.width, 0.7 * video_info.height);  

            const random_png_name = randomBytes(5).toString("hex")
            //const png_path = path.join(__dirname, "..", `/files/temp/images/`)
            const png_path = "/tmp/"

            // if(!fs.existsSync(png_path)){
            //     fs.mkdirSync(png_path)
            // }

            fs.writeFileSync(png_path+`${random_png_name}.jpg`, canvas.toBuffer('image/jpeg', { quality: 0.75 }))
            images.push(png_path+`${random_png_name}.jpg`)
        }
        var d_images = []
        for (let index = 0; index < 4; index++) {
            for(var image of images){
                d_images.push(image)
            }
        }

        const random_name = randomBytes(25).toString("hex")

        //const video_path = path.join(__dirname, "..", `/files/temp/${random_name}.mp4`)
        const video_path = `/tmp/${random_name}.mp4`

        var data;
        videoshow(d_images, videoOptions)
            .audio(audio_path, {fade: false})
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