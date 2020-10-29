const Discord = require('discord.js');
const Utils = require("./../../utils/utils")
const fs = require("fs")

const ImageProcessor = require("./ImageProcessor")



module.exports = {
	validate(client, message) {
		return true;
	},
	/**
	 * @param  {Discord.Client} client
	 * @param  {Discord.Message} message
	 * @param  {Array} args
	 */
	run: (client, message, args) => {
		return new Promise(async(resolve, reject)=>{
			let text = args.join(" ").slice(0,220)
			text = text.replace(/\n/gi, ' ')
			if(args.length <= 0 ){
				text = await (await message.channel.messages.fetch({ limit: 2 })).last()["content"]
			}
	
			if(text == ""){
				return message.channel.send(
					Utils.createSimpleEmbed("❌ Erro ao digitar comando:", `Use  **${process.env.COMMAND_PREFIX}filosofo <frase que você quiser>** ou somente **${process.env.COMMAND_PREFIX}filosofo** que eu pego a ultima mensagem mandada! 🤗`, client.user.username, client.user.avatarURL())
				);
			}
	
			message.channel.startTyping()
	
			var filosofo_info = JSON.parse(fs.readFileSync(__dirname+"/philosophers_list.json"))["philosophers"]
			filosofo_info = filosofo_info[Math.floor(Math.random() * filosofo_info.length)]
	
			ImageProcessor(filosofo_info["name"], filosofo_info["pic"], text)
			.then((image)=>{
				const embed = new Discord.MessageEmbed()
				.setColor('#9d65c9')
				.setTitle("O que o filósofo disse?")
				.setAuthor(filosofo_info["name"])
				.setDescription(`Mensagem de: ${message.author.username}`)
				.attachFiles(image)
				.setImage("attachment://image.png")
				message.channel.stopTyping()
				resolve(message.channel.send(embed))
			})
			.catch((err)=>{
				message.channel.stopTyping()
				reject(err)
				//return message.channel.send(Utils.getErrorMessage())
			})
		})
	},

	get command() {
		return {
			name: 'filosofo',
			description: 'O que será que o filósofo disse?',
			usage: 'filosofo',
			aliases: [
				"filosofos",
				"filo"
			]
		};
	},
};