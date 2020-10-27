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

        // SE MARCAR O USUÁRIO
        if(args.length == 1 && (message.mentions.users.size > 0)){
            var usuario_desafiado = message.mentions.users.entries().next().value[1]

            const embed = new Discord.MessageEmbed()
            .setTitle('Informações da batalha 🐓')
            .addField('Desafiador', message.author.username)
            .addField('Desafiado', usuario_desafiado.username)
            .addField('Para aceitar a rinha:', '>aceitarrinha')
            .setColor('#8146DC')
            .setFooter(`All rights reserved @ ${client.user.username} - ${new Date().getFullYear()}`, client.user.avatarURL());
            return message.channel.send(embed);
        }else{
            // SE NÃO MARCAR O USUÁRIO
            const embed = new Discord.MessageEmbed()
            .setTitle('Manual para a rinha! 🐓')
            .setDescription("Nos criamos por amor, eles brigam por instinto!")
            .addField('Como desafiar outros galos', '>boprarinha @usuário')
            .addField('Para saber mais:', '>rinha')
            .setThumbnail("https://i.imgur.com/acY4QQr.jpg")
            .setColor('#8146DC')
            .setFooter(`All rights reserved @ ${client.user.username} - ${new Date().getFullYear()}`, client.user.avatarURL());
            return message.channel.send(embed);
        }
    },

    get command() {
        return {
            name: 'boprarinha',
            description: 'Desafia um usuário para a rinha',
            usage: 'boprarinha @usuario'
        }
    },
};


