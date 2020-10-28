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
                Utils.createSimpleEmbed("❌ Erro ao digitar comando:", `➡️ Use  **${process.env.COMMAND_PREFIX}crush @usuario** mostrar a todos quem é o seu crush! 🤗`, client.user.username, client.user.avatarURL())
            );

		}
		let metioned_user = message.mentions.users.entries().next().value[1]

		if(message.author == metioned_user){
			return message.channel.send(
				Utils.createSimpleEmbed("❌ Pera lá né amigo", `Você não pode ter um crush em você mesmo... 😑\n Ou será que pode? 🤔`, client.user.username, client.user.avatarURL())
			)
		}

		if(metioned_user == client.user){
			return message.channel.send(
				Utils.createSimpleEmbed("😬 Opa, então né...", `Agradeço e tals mas tô passando`, client.user.username, client.user.avatarURL())
			)
		}

		let sent_1 = [
			"sem fazer nada",
			"jogando um mine",
			"comendo uma feijoada",
			"colocando o gado pro curral",
			"vendo a live do Xandão",
			"olhando sua foto pela 20ª hoje"
		]
		sent_1 = sent_1[Math.floor(Math.random() * sent_1.length)]

		let sent_2 = [
			"eu te acho muito legal",
			"eu te acho lindo(a) pra xuxu",
			"eu queria jogar minecraft com você",
			"eu queria te beijar :3",
			"eu salvei teu contato como amorzin :3"
		]
		sent_2 = sent_2[Math.floor(Math.random() * sent_2.length)]

		let sent_3 = [
			"eu mataria um smurf por você",
			"na verdade é mesmo",
			"eu pularia na lava com minha picareta de diamante por você",
			"eu to caidinho por você",
			"eu to caidinho pelo seu pai",
			"eu lavaria meu pé por você",
			"eu só queria minha sandália do Relambado Marquins que eu deixei na sua casa"
		]
		sent_3 = sent_3[Math.floor(Math.random() * sent_3.length)]

		let sent_4 = [
			"deu ver teu pai",
			"da gente tomar um açai",
			"da gente jogar um minecraft",
			"da gente se casar e ir morar na Irlanda e ficar ouvindo Billie Eilish e comendo pastel até a gente morrer velhinhos e juntinhos **EU TE AMO SE NÃO PERCEBEU AINDA**",
			"da gente namorar",
			"da gente casar",
			"da gente se chamar de prezinhos(as)"
		]
		sent_4 = sent_4[Math.floor(Math.random() * sent_4.length)]
		

		const text = `Oi, ${metioned_user}. Né? 😊 Então... tava aqui ${sent_1} e pensei em falar que ${sent_2}.\nSei que parece estranho 🥺, mas ${sent_3}.\nIae, alguma chance ${sent_4}? 😚🥰`
		return message.channel.send(
			new Discord.MessageEmbed()
			.setTitle("😘 Oie...")
			.setDescription(text)
			.setThumbnail(message.author.avatarURL())
			.setFooter(`Mensagem de ${message.author.username}`)
		)

	},

	get command() {
		return {
			name: 'crush'
		};
	},
};