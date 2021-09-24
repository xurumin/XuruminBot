const Discord = require('discord.js');
const database = require("./../../utils/database");
const Utils = require("./../../utils/utils");
const fs = require("fs");

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
		if (!message.mentions.users.size > 0) {
			return message.send_(
                Utils.createSimpleEmbed("❌ Erro ao digitar comando:", `➡️ Use  **${process.env.COMMAND_PREFIX}marcarbriga @usuario** para marcar a briga! 🤗`)
            );

		}
		let metioned_user = message.mentions.users.entries().next().value[1];

		if(message.author == metioned_user){
			return message.send_(
				Utils.createSimpleEmbed("❌ Pera lá né amigo", `Você não pode brigar com você mesmo 😑`)
			);
		}

		const places = [
			"Bodega do seu Joelson",
			"Bar do Tonin Matador",
			"Casa do Prefeito",
			"Na casa do pai rs",
			"No mine",
			"Na vila do Chaves",
			"Na aula online"
		];
		const schedules = [
			"Próxima sexta",
			"Quando acabar a EAD",
			"Hoje",
			"Às 4:21",
			"Quando você quiser pai ta pronto",
			"Quando tu largar de ser besta"
		];
		return message.send_(
			new Discord.MessageEmbed()
			.setTitle("😤 Chamado para a briga")
			.setDescription(`**${message.author}** chamou **${metioned_user}** pra briga\n⌚️ **Horario**: ${schedules[Math.floor(Math.random() * schedules.length)]}\n🗺️ **Local**: ${places[Math.floor(Math.random() * places.length)]}\n**É bom aparecer seu troxão** 😡`)
			.setThumbnail(message.author.avatarURL())
		);

	},

	get command() {
		return {
			name: 'marcarbriga'
		};
	},
};