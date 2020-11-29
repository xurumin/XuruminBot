const { default: Axios } = require("axios");
const Discord = require("discord.js")
require('dotenv/config');


const WEBHOOK = process.env.DISCORD_CMD_NOTIFIER_WEBHOOK

/**
 * @param  {Discord.Message} msg
 */
function genLogPattern(msg) {
    if (!msg || !msg.guild.name) return {}
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

function sendWebhook(info) {
    var items = [
        {
            name: "Sender Name / Id",
            value: `${info.request.author.username} / ${info.request.author.id}`
        },
        {
            name: "Sender Content",
            value: info.request.message.content
        },
        {
            name: "Sender Datetime",
            value: String(info.request.message.date)
        },
        {
            name: "Responser Name / Id",
            value: `${info.response.author.username} / ${info.response.author.id}`
        },
        {
            name: "Responser Content",
            value: info.response.message.content
        },
        {
            name: "Responser Datetime",
            value: String(info.response.message.date)
        }
    ]
    console.log(items)
    //"description": `Guild Name: ${info.guild.name}\nGuild Id: ${info.guild.id}\nChannel Name: ${info.guild.channel.name}`,
    var options = {
        "headers": {
            "Content-Type": "application/json",
        },
        "payload": JSON.stringify({
            "content": "‌",
            "embeds": [{
                "title": "New command!",
                "color": 33023,
                "fields": items
            }]
        })
    };

    return Axios.post(WEBHOOK, options.payload, {
        headers: options.headers
    })
}

module.exports = {
    /**
     * @param  {Discord.Message} request_message
     * @param  {Discord.Message} response_message
     */
    async log(request_message, response_message) {
        if (!request_message) return;
        var info = {
            bot: {
                shard_id: process.env.SHARD_ID
            },
            request: genLogPattern(request_message),
            response: genLogPattern(response_message)
        }
        if (WEBHOOK) {
            return await sendWebhook(info)
        }
        return;
    }
}