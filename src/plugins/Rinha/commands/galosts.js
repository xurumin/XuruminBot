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
        .setTitle('Status do galo! 🐓')
        .setDescription("Aqui você encontra todas as informações sobre seu galo!")
        .addField('Apelido', 'Roberval, o Samurai Calculista')
        .addField('Ataque 🥊 ', 'Feature em construção 🕵🏼')
        .addField('Defesa ⚔️', 'Feature em construção 🕵🏼')
        .addField('Popularidade 😎', 'Feature em construção 🕵🏼')
        .setThumbnail("https://i.imgur.com/yRUziUk.jpg")
        .setColor('#8146DC')
        .setFooter(`All rights reserved @ ${client.user.username} - ${new Date().getFullYear()}`, client.user.avatarURL());;

        //message.author.send(embed)
        return message.channel.send(embed);
        // return message.channel.send("Alguma coisa deu errado...");

    },

    get command() {
        return {
            name: 'galosts',
            description: 'Status galinacéo',
            usage: 'galosts'
        }
    },
};