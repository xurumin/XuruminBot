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
        .setTitle('Manual para a rinha! 🐓')
        .setDescription("Nos criamos por amor, eles brigam por instinto!")
        .addField('Capture seu galo', '>galocreate')
        .addField('Verifique o status do seu galo', '>galosts')
        .addField('Desafie outros galos', '>boprarinha @usuário')
        .setThumbnail("https://i.imgur.com/acY4QQr.jpg")
        .setColor('#8146DC')
        .setFooter(`All rights reserved @ ${client.user.username} - ${new Date().getFullYear()}`, client.user.avatarURL());;

        //message.author.send(embed)
        return message.channel.send(embed);
        // return message.channel.send("Alguma coisa deu errado...");

    },

    get command() {
        return {
            name: 'rinha',
            description: 'Rinha de galo',
            usage: 'rinha'
        }
    },
};