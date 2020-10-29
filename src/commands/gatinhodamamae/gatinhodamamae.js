const Discord = require('discord.js');
const database = require("./../../utils/database")
const fs = require("fs")

const {
	createCanvas,
	createImageData,
	loadImage
} = require('canvas')

function makecatimage(profile_pic) {
	return new Promise(async (resolve, reject) => {
		const canvas = createCanvas(300, 300)
		const ctx = canvas.getContext('2d')
		const image = await loadImage(profile_pic)

		ctx.fillStyle = 'orange';
		ctx.fillRect(0, 0, 300, 300)
		const love_filter_1 = await loadImage(__dirname + "/files/2MzD9kN.png")
		const love_filter_2 = await loadImage(__dirname + "/files/7O8Mg3n.png") //hearts
		const love_filter_3 = await loadImage(__dirname + "/files/i.png") //i love you

		//desenha a foto do usuário
		ctx.drawImage(image, 0, 0, 300, 300)
		//coloca o filtro
		ctx.drawImage(love_filter_1, 0, 0, 300, 300)

		ctx.drawImage(love_filter_2, 0, 0, 300, (300 * love_filter_2.height / love_filter_2.width))

		ctx.drawImage(love_filter_3, 0, 300 - (200 * love_filter_3.height / love_filter_3.width), 200, (200 * love_filter_3.height / love_filter_3.width))


		ctx.fillStyle = '#F5DD47';
		ctx.font = 'bold 23px Arial'

		ctx.shadowColor = "black";
		ctx.shadowBlur = 4;
		ctx.shadowOffsetX = 0;
		ctx.shadowOffsetY = 0;
		const text = 'Gatinho da mamae! 😍😍';

		var mensureText = ctx.measureText(text)

		ctx.fillText(text, (canvas.width / 2) - (mensureText.width / 2), 280)

		resolve(new Discord.MessageAttachment(canvas.toBuffer(), 'image.png'))
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
	run: async (client, message, args) => {
		if (message.mentions.users.size > 0) {
			return message.channel.send(await makecatimage(message.mentions.users.entries().next().value[1].avatarURL({
				format: "png"
			})))

		} else {
			return message.channel.send(await makecatimage(message.author.avatarURL({
				format: "png"
			})))
		}

	},

	get command() {
		return {
			name: 'gatinhodamamae'
		};
	},
};