"use strict";

const Discord = require('discord.js');
const Utils = require("./../../../utils/utils")
const fs = require("fs")

const VideoGenerator = require("./../VideoGenerator/catvibing");


var globalCooldown = []

function run_gen(client, message, args,loading_msg, LOCALE) {
	return new Promise(async(resolve, reject)=>{
        const tagged_user = message.mentions.users.entries().next()
        var user = message.author
        if (tagged_user.value) user = tagged_user.value[1];
        var user_pic = user.avatarURL({
            format: "png",
            size: 256
        })
        if (!user_pic) {
            loading_msg = await loading_msg
            var msg = {
                title: LOCALE.errors.user_do_not_have_pic.title,
                description: LOCALE.errors.user_do_not_have_pic.description
            }
            globalCooldown.shift()
            return resolve(loading_msg.edit(
                Utils.createSimpleEmbed(msg.title, msg.description)
            ));
        }
		VideoGenerator(user_pic, message)
		.then(async (image)=>{
			loading_msg = await loading_msg
			await message.channel.send(image[0])
            var fi = image[1]
            await fs.unlinkSync(fi.video);
            for(var image of fi.images){
                await fs.unlinkSync(image); 
            }
            resolve()
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
        const isPremium = await Utils.Profile.isPremium(client, message.author.id)
        if(!isPremium){
            const notPremiumEmbed = new Discord.MessageEmbed()
            .setColor('#9d65c9')
            .setTitle(LOCALE.errors.user_is_not_premium.title)
            .setDescription(LOCALE.errors.user_is_not_premium.description.interpolate({
                prefix: process.env.COMMAND_PREFIX
            }))
            return message.channel.send(notPremiumEmbed)
        }
        const embed = new Discord.MessageEmbed()
            .setColor('#9d65c9')
            .setTitle(LOCALE.messages.loading.title)
            .setDescription(LOCALE.messages.loading.description)

        var loading_msg = message.channel.send(embed)

        globalCooldown.push(message.id)
        if (isMe(message.id)) {
            return run_gen(client, message, args, loading_msg, LOCALE)
        }



        var cd = setInterval(() => {
            if (isMe(message.id)) {
                clearInterval(cd)
                return run_gen(client, message, args, loading_msg, LOCALE)
            }
        }, 2000)
    },
    get command() {
        return {
            name: 'catvibing',
            aliases: ["catvideo"]
        }
    },
};