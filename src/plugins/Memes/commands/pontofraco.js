const Discord = require('discord.js');
const Utils = require("./../../../utils/utils")
const fs = require("fs")
const {
	createCanvas,
    loadImage,
    registerFont
} = require('canvas')

registerFont(__dirname+"./../../../files/arial-black.ttf", {family: "arialblack"})

function ImageProcessor(user_pic_1,user_pic_2) {
    return new Promise(async (resolve, reject) => {
        var width = 566
        var height = 693
        
        const canvas = createCanvas(width, height)
        const ctx = canvas.getContext('2d')

        var imgs_info = {
            img1: {"x":18,"y":460,"width":265,"height":200,"angle":0},
            img2: {"x":285,"y":460,"width":265,"height":200,"angle":0}
        }

        ctx.drawImage(await loadImage("https://i.imgur.com/cwu3dR5.png"), 0, 0, width,height);
        ctx.drawImage(await loadImage(user_pic_1), imgs_info["img1"].x, imgs_info["img1"].y, imgs_info["img1"].width,imgs_info["img1"].height);
        ctx.drawImage(await loadImage(user_pic_2), imgs_info["img2"].x, imgs_info["img2"].y, imgs_info["img2"].width,imgs_info["img2"].height);

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
	 * @param  {Array} args
	 */
	run: (client, message, args, LOCALE) => {
		return new Promise(async(resolve, reject)=>{
			const tagged_users = message.mentions.users.array()
            var userImages = []

            if(tagged_users.length <2){
                var msg = {
                    title: LOCALE.errors["need_more_users"].title,
                    description: LOCALE.errors["need_more_users"].description
                }
                return resolve(message.send_(
                    Utils.createSimpleEmbed(msg.title, msg.description)
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
                    return resolve(message.send_(
                        Utils.createSimpleEmbed(msg.title, msg.description)
                    ));
                }
                userImages.push(user_pic)
            }

			message.send_Typing();
			

			ImageProcessor(userImages[0], userImages[1])
			.then((image)=>{
				const embed = new Discord.MessageEmbed()
				.setTitle(LOCALE.title)
				.setDescription(`${message.author}`)
				.attachFiles(image)
				.setImage("attachment://image.png")

				
				return resolve(message.send_(embed))
			})
			.catch((err)=>{
				
				reject(err)
			})
		})
	},

	get command() {
		return {
			name: 'pontofraco'
		};
	},
};