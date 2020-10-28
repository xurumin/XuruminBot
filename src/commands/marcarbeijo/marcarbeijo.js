const Discord = require('discord.js');
const database = require("./../../utils/database")
const Utils = require("./../../utils/utils")
const fs = require("fs")

module.exports = {
	validate(client, message) {
		if (!message.member.hasPermission('MANAGE_GUILD')) {
			throw new Error('no_permission');
		}
	},
	/**
	 * @param  {Discord.Client} client
	 * @param  {Discord.Message} message
	 * @param  {} args
	 */
	run: async (client, message, args) => {
		if (!message.mentions.users.size > 0) {
			return message.channel.send(
                Utils.createSimpleEmbed("❌ Erro ao digitar comando:", `➡️ Use  **${process.env.COMMAND_PREFIX}marcarbeijo @usuario** para marcar o beijin! 🤗`, client.user.username, client.user.avatarURL())
            );

		}
		let metioned_user = message.mentions.users.entries().next().value[1]

		if(message.author == metioned_user){
			return message.channel.send(
				Utils.createSimpleEmbed("❌ Pera lá né amigo", `Você não pode beijar com você mesmo... 😑\n Ou será que pode? 🤔`, client.user.username, client.user.avatarURL())
			)
		}

		if(metioned_user == client.user){
			return message.channel.send(
				Utils.createSimpleEmbed("😬 Opa, então né...", `Agradeço e tals mas tô passando`, client.user.username, client.user.avatarURL())
			)
		}


		const places = [
			"Bodega do seu Joelson",
			"Bar do Tonin Matador",
			"Casa do Prefeito",
			"Na casa do pai rs",
			"No mine",
			"Na vila do Chaves",
			"Na aula online",
			"No among"
		]
		const schedules = [
			"Próxima sexta",
			"Quando acabar a EAD",
			"Hoje",
			"Às 4:21",
			"Quando você quiser pai ta pronto",
			"Quando tu largar de ser besta"
		]
		return message.channel.send(
			new Discord.MessageEmbed()
			.setTitle("😘 Chamado para me beijar rs")
			.setDescription(`**${message.author}** chamou **${metioned_user}** pro beijo 🥰\n⌚️ **Horario**: ${schedules[Math.floor(Math.random() * schedules.length)]}\n🗺️ **Local**: ${places[Math.floor(Math.random() * places.length)]}\n**É bom aparecer seu troxão** 😡`)
			.setThumbnail(message.author.avatarURL())
		)

	},

	get command() {
		return {
			name: 'marcarbeijo'
		};
	},
};