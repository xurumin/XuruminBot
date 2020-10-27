const Discord = require('discord.js');
const database = require("./../../utils/database")
const utils = require("./../../utils/utils")

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
		//database.createDatabase()
		let msgsplt = message.content.split(" ")

		
		if(msgsplt.length != 2) return message.channel.send(
			utils.createSimpleEmbed("🤖 Comando errado!", "**Como usar:** >set_channel <intervalo em minutos>\n**Exemplo:** >set_channel 20", client.user.username, client.user.avatarURL())
		)
		
        //var term_to_search = msgsplt.slice(1, msgsplt.length).join(" ")

		message.channel.send(msgsplt)

		return;
		const time = 60 * 1000

		if(database.getServer(message.guild.id).length > 0){
			database.updateChannel(message.guild.id, message.channel.id, time)
			message.channel.send("Canal atualizado!");
			return message.channel.send(`Você irá receber um novo meme a cada ${(time/1000/6).toFixed(2)}  minutos`);
        }
		database.addChannel(message.guild.id, message.channel.id, time)
		message.channel.send("Canal adicionado!");
		return message.channel.send(`Você irá receber um novo meme a cada ${(time/1000/6).toFixed(2)} minutos`);
	},

	get command() {
		return {
			name: 'set_channel',
			description: 'Irá setar um canal para receber memes',
			usage: 'set_channel <interval in minutes>',
		};
	},
};