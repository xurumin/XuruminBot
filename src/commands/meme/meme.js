const Discord = require('discord.js');
const random_meme = require("./random_meme")

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
		var meme = await random_meme.getRandomMeme()
		const meme_embed = new Discord.MessageEmbed()
		.setTitle('Hm, que tal um meme?')
		.setDescription(meme.text)
		.setColor('#8146DC')
		.setImage(meme.url)
		.setFooter(
			`${(meme.source).toLocaleUpperCase()} - ${meme.author.screen_name}`,
			'https://i.imgur.com/PAYbEgv.png'
		);
		return message.channel.send(meme_embed);
		
	},

	get command() {
		return {
			name: 'meme',
			description: 'Usuário irá receber um meme.',
			usage: 'meme',
		};
	},
};