const Discord = require("discord.js")
require('dotenv/config');


/**
 * @param  {Discord.Message} msg
*/
function genLogPattern(msg){
    if(!msg || !msg.guild.name) return {}
    return {
        guild: {
            name: msg.guild.name,
            id: msg.guild.id,
            channel: {
                name: msg.channel.name,
                id: msg.channel.id
            }
        },
        author: {
            username: msg.author.username,
            id: msg.author.id
        },
        message: {
            date: msg.createdAt,
            content: msg.content,
            embed: msg.embeds[0]
        },
    }
}

module.exports = {
    /**
     * @param  {Discord.Message} request_message
     * @param  {Discord.Message} response_message
     */
    log(request_message, response_message){
        if(!request_message) return;
        var info = {
            bot:{
                shard_id: process.env.SHARD_ID
            },
            request: genLogPattern(request_message),
            response: genLogPattern(response_message)
        }
        //console.log(info)
    }
}