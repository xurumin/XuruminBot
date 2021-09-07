const Discord = require('discord.js');
const Utils = require("./../../../utils/utils")
const fs = require("fs")
const {
	createCanvas,
    loadImage,
    registerFont
} = require('canvas')

registerFont(__dirname+"./../../../files/arial-black.ttf", {family: "arialblack"})

function ImageProcessor(user_pic, phrase) {
    return new Promise(async (resolve, reject) => {
        var width = 512
        var height = 512
        const canvas = createCanvas(width, height)
        const ctx = canvas.getContext('2d')

        ctx.drawImage(await loadImage(user_pic), 0, 0, width,height);


		ctx.globalCompositeOperation = "saturation";
        ctx.fillStyle = "hsl(0,100%,50%)"  // saturation at 100%
        ctx.fillRect(0,0,width,width);  // apply the comp filter
        ctx.globalCompositeOperation = "source-over";  // restore default comp 

		ctx.fillStyle = `rgba(${Utils.random(0,255)}, ${Utils.random(0,255)}, ${Utils.random(0,255)}, 0.2)`
        ctx.fillRect(0,0,width,width);

        ctx.fillStyle = "white";
        ctx.font = "40px arialblack";
        ctx.textAlign = "center"

        var text_lines_top = phrase[0].split("\n")
        var text_lines_bottom = phrase[1].split("\n")

        var line_height = 45;
        var x = width/2;
        var y = height-(line_height*text_lines_bottom.length)+20;     
        
        //draw bottom
        for(var line of text_lines_bottom){
            ctx.lineWidth = 10
            ctx.strokeStyle = "black";
            ctx.strokeText(line, x, y);
            
            ctx.fillText(line, x, y)
            y+=line_height
        }
        //draw top
        y=line_height+10
        for(var line of text_lines_top){
            ctx.lineWidth = 10
            ctx.strokeStyle = "black";
            ctx.strokeText(line, x, y);
            
            ctx.fillText(line, x, y)
            y+=line_height
        }
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
			const tagged_user = message.mentions.users.entries().next()
            var user = message.author
            if (tagged_user.value) user = tagged_user.value[1];

            var user_pic = user.avatarURL({
                format: "png",
                size: 512
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

			
			//Utils.choice(LOCALE["noiaPhrases"])
			//LOCALE["noiaPhrases"][LOCALE["noiaPhrases"].length-1]
			ImageProcessor(user_pic, Utils.choice(LOCALE["noiaPhrases"]))
			.then((image)=>{
				const embed = new Discord.MessageEmbed()
				.setTitle(LOCALE.title)
				.setDescription(`${message.author}`)
				.attachFiles(image)
				.setImage("attachment://image.png")
				.setFooter("Phrases by Xurumin, @noiacoisas, pensador.com")

				
				return resolve(message.send_(embed))
			})
			.catch((err)=>{
				
				reject(err)
			})
		})
	},

	get command() {
		return {
			name: 'noia',
			aliases: [
				"noiafrase"
			]
		};
	},
};