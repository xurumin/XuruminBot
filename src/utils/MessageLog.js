const { default: Axios } = require("axios");
require('dotenv/config');


const WEBHOOK = process.env.DISCORD_CMD_NOTIFIER_WEBHOOK;

/**
 * @param  {Discord.Message} msg
 */
function genLogPattern(msg) {
    if (!msg || !msg.guild.name) return {};
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
    };
}

function sendWebhook(info) {
    var items = [
        {
            name: "Sender Name / Id",
            value: `${info.request.author.username} / ${info.request.author.id}`
        },
        {
            name: "Command",
            value: info.command
        },
        {
            name: "Sender Content",
            value: info.request.message.content
        },
        {
            name: "Sender Datetime",
            value: String(info.request.message.date)
        }
    ];
    var text = `**New command on guild \` ${info.request.guild.name} \`**\n`+items.map((elm)=>{
        return `**${elm.name}**: \` ${elm.value} \``;
    }).join("\n");
    
    var options = {
        "headers": {
            "Content-Type": "application/json",
        },
        "payload": JSON.stringify({
            "content": text
        })
    };

    return Axios.post(WEBHOOK, options.payload, {
        headers: options.headers
    });
}

module.exports = {
    /**
     * @param  {Discord.Message} request_message
     */
    async log(command, request_message) {
        if (!request_message) return;
        var info = {
            bot: {
                shard_id: process.env.SHARD_ID
            },
            command: command,
            request: genLogPattern(request_message)
            //response: genLogPattern(response_message)
        };
        if (WEBHOOK) {
            return await sendWebhook(info);
        }
        return;
    }
};