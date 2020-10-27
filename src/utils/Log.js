const Discord = require("discord.js")


module.exports = {
    /**
     * @param  {Discord.Message} request_message
     * @param  {Discord.Message} response_message
     */
    log(request_message, response_message){
        var info = {
            request: {
                guild: {
                    name: request_message.guild.name,
                    id: request_message.guild.id,
                    channel: {
                        name: request_message.channel.name,
                        id: request_message.channel.id
                    }
                },
                author: {
                    username: request_message.author.username,
                    id: request_message.author.id
                },
                message: {
                    date: request_message.createdAt,
                    content: request_message.content,
                    embed: request_message.embeds[0]
                },
            },
            response: {
                guild: {
                    name: response_message.guild.name,
                    id: response_message.guild.id,
                    channel: {
                        name: response_message.channel.name,
                        id: response_message.channel.id
                    }
                },
                author: {
                    username: response_message.author.username,
                    id: response_message.author.id
                },
                message: {
                    date: response_message.createdAt,
                    content: response_message.content,
                    embed: response_message.embeds
                },
            }
        }
        console.log(info)
    }
}