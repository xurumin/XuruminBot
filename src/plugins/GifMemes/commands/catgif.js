"use strict";

const Discord = require('discord.js');
const Utils = require("./../../../utils/utils")
const fs = require("fs")

const ImageGenerator = require("./../ImageGenerators/catgif")

var globalCooldown = []

function run(client, message, args,loading_msg, LOCALE) {
	return new Promise(async(resolve, reject)=>{
		ImageGenerator(message.author.avatarURL({format: "png", size: 256}), message)
		.then(async (image)=>{
			const embed = new Discord.MessageEmbed()
			.setColor('#9d65c9')
			.setTitle(LOCALE.messages.loaded.title)
			.setDescription(LOCALE.messages.loaded.description)
			.attachFiles(image)
			.setImage("attachment://image.gif")

			loading_msg = await loading_msg
			resolve(await message.channel.send(embed))
			loading_msg.delete()
			return globalCooldown.shift()
		})
		.catch((err)=>{
			message.channel.stopTyping()
			reject(err)
		})
	})
}

function isMe(id){
	if(globalCooldown[0]==id){
		return true
	}
	return false
}

module.exports = {
    validate(client, message) {
        return true;
    },
    /**
     * @param  {Discord.Client} client
     * @param  {Discord.Message} message
     * @param  {} args
     */
    run: async (client, message, args, LOCALE) => {
        const embed = new Discord.MessageEmbed()
            .setColor('#9d65c9')
            .setTitle(LOCALE.messages.loading.title)
            .setDescription(LOCALE.messages.loading.description)

        var loading_msg = message.channel.send(embed)

        globalCooldown.push(message.id)
        if (isMe(message.id)) {
            return run(client, message, args, loading_msg, LOCALE)
        }



        var cd = setInterval(() => {
            if (isMe(message.id)) {
                clearInterval(cd)
                return run(client, message, args, loading_msg, LOCALE)
            }
        }, 2000)
    },
    get command() {
        return {
            name: 'catgif'
        }
    },
};