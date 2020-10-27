const Discord = require('discord.js');

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

        var gif_list = [
            'https://i.imgur.com/YxiDyic.mp4'
        ];
        var rand = gif_list[Math.floor(Math.random() * gif_list.length)];
        let user = message.mentions.users.first() || client.users.cache.get(args[0]);
        if (!user || user == message.author.username) {
            return message.reply('Você precisa desafiar alguem ou ser desafiado para aceitar a rinha!');
        }
        message.channel.send(
            new Discord.MessageEmbed()
            .setColor('#9d65c9')
            .setTitle("Ultimate Rinha Combat")
            .setAuthor(client.user.username)
            .setDescription(`**${message.author.username}** aceitou o desafio de **${user.username}**! `)
            .setImage("https://media.tenor.com/images/e955f55bab6839ec724531e3bae3303c/tenor.gif")
            )

    },

    get command() {
        return {
            name: 'aceitarrinha',
            description: 'Vai fugir do desafio meu patrão?',
            usage: 'aceitarrinha'
        }
    }
};