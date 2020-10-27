const Discord = require('discord.js');
require('dotenv/config');

const talkedRecently = new Set();
module.exports = {
	/**
	 * @param  {Discord.Client} client
	 * @param  {Discord.Message} message
	 * @param  {} args
	 */
	run: async (client, message) => {
		/**
		 * Se a mensagem do bot for o @ do bot
		 */
		if (message.content == `<@!${client.user.id}>`) {
			const embed = new Discord.MessageEmbed()
				.setTitle('Oi! Meu nome é Biriba! 😁')
				.setDescription(`Para me usar, basta utilizar o prefixo **${process.env.COMMAND_PREFIX}** + o comando que você quiser! 🤓\nExperimenta usar **>meme** 🤠`)
				.addField('Prefixo', process.env.COMMAND_PREFIX)
				.addField('Ajuda?', `${process.env.COMMAND_PREFIX}help`)
				.setThumbnail(client.user.avatarURL())
				.setColor('#8146DC')
				.setFooter(`All rights reserved @ ${client.user.username} - ${new Date().getFullYear()}`, client.user.avatarURL());;

			return message.channel.send(embed);
		}

		if (message.content.startsWith(process.env.COMMAND_PREFIX)) {
			if (talkedRecently.has(message.author.id)){
				const embed = new Discord.MessageEmbed()
					.setTitle('Calma lá, amigo! 🖐')
					.setDescription(`Você precisa esperar **5 segundos** antes de mandar outra mensagem! 🤠`)
					.setColor('#8146DC')
				return message.channel.send(embed);
			}
			talkedRecently.add(message.author.id);
			setTimeout(() => {
				talkedRecently.delete(message.author.id);
			}, 5000); 
			const args = message.content
				.slice(process.env.COMMAND_PREFIX.length)
				.trim()
				.split(/ +/g);
			const command = args.shift().toLowerCase();

			const cmd = client.commands.get(command);
			if (!cmd) return;
			await cmd.run(client, message, args);
			try {
				//await cmd.run(client, message, args);
			} catch (error) {
				//message.channel.send("Alguma coisa deu errado... 😔")
			}
			
		}
	},

	get event() {
		return {
			eventName: 'message'
		};
	},
};