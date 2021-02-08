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
			if (message.mentions.users.size > 0) {
				message.channel.startTyping()

				setTimeout(() => {
					message.channel.stopTyping();
				}, 5000);

				ImageProcessor(message.mentions.users.entries().next().value[1].avatarURL({
					format: "png"
				}))
				.then((image)=>{
					const embed = new Discord.MessageEmbed()
					.setColor('#9d65c9')
					.setTitle("Funcionário do Mês! 🥳")
					.setAuthor(client.user.username)
					.setDescription(`Parabéns ${message.mentions.users.entries().next().value[1]}!\nVocê ganho o título de **Funcionário do Mês** por ${message.author}`)
					.attachFiles(image)
					.setImage("attachment://image.png")
					message.channel.stopTyping()
					resolve(message.channel.send(embed))
				})
				.catch((err)=>{
					message.channel.stopTyping()
					reject(err)
				})
	
			} else {
				return message.channel.send(
					Utils.createSimpleEmbed("❌ Erro ao digitar comando:", `Use  **${process.env.COMMAND_PREFIX}funcionariodomes @usuario** para dar o título de **Funcionário do Mês** 🤗`, client.user.username, client.user.avatarURL())
				);
			}
		})
	},

	get command() {
		return {
			name: 'funcionariodomes',
			aliases: [
				"fdm"
			]
		};
	},
};