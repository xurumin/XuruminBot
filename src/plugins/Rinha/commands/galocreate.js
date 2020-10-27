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
        const embed = new Discord.MessageEmbed()
        .setTitle('A wild galo appears!! 🐓')
        .setDescription("Parabéns, galo capturado com sucesso!")
        .addField('Nomeie seu galo', '>galoname <nomeDoGalo>')
        .setThumbnail("https://i.imgur.com/t9Fa3tN.png")
        .setColor('#8146DC')
        .setFooter(`All rights reserved @ ${client.user.username} - ${new Date().getFullYear()}`, client.user.avatarURL());;

        //message.author.send(embed)
        return message.channel.send(embed);
        // return message.channel.send("Alguma coisa deu errado...");

    },

    get command() {
        return {
            name: 'galocreate',
            description: 'Crie seu galo',
            usage: 'galocreate'
        }
    },
};