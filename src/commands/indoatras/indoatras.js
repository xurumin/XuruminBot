const Discord = require('discord.js');
const Utils = require("./../../utils/utils")
const fs = require("fs")

const ImageProcessor = require("./ImageProcessor")

var whathedoeslist = [
	"que tira o sono dela",
	"que vive molhando ela",
	"que vive beijando a boca dela",
	"que vive travando o zap dela",
	"que vive matando ela no among",
	"que vive robando os itens dela no minecraft",
	"que vive fazendo ela chorar",
	"que vive chateando ela",
	"que vive tirando a bateria do iphone dela",
	"que vive ligando pra ela",
	"que vive indo matar o rato na casa dela",
	"que vive ligando pra casa dela",
	"que vive marcando ela em meme",
	"que vive marcando ela em meme de cozinha"
]

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
			let text = args.join(" ").slice(0,23)
			text = text.replace(/\n/gi, ' ')
			if(args.length <= 0 || text==""){
				return message.channel.send(
					Utils.createSimpleEmbed("❌ Erro ao digitar comando:", `Use  **${process.env.COMMAND_PREFIX}indoatras <frase que você quiser>** para ir daquele que fez alquilo! 🤗`, client.user.username, client.user.avatarURL())
				);
			}
			message.channel.startTyping()
			
			ImageProcessor(text, whathedoeslist[Math.floor(Math.random() * whathedoeslist.length)])
			.then((image)=>{
				const embed = new Discord.MessageEmbed()
				.setColor('#9d65c9')
				.setTitle("Indo atrás daquele...")
				.setAuthor(message.author.username)
				.setDescription(`Mensagem de: ${message.author.username}`)
				.attachFiles(image)
				.setImage("attachment://image.png")
				message.channel.stopTyping()
				resolve(message.channel.send(embed))
			})
			.catch((err)=>{
				message.channel.stopTyping()
				reject(err)
			})
		})
	},

	get command() {
		return {
			name: 'indoatras',
			aliases: [
				"indoatrasdessetalde",
				"indoatrasdesse",
				"iadtd"
			]
		};
	},
};