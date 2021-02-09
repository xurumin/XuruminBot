const Discord = require('discord.js');
const Utils = require("./../../utils/utils")
const fs = require("fs")

const ImageProcessor = require("./ImageProcessor");
const utils = require('./../../utils/utils');


var allBadges = [];

async function getAllBadges(){
	allBadges = await utils.Profile.getBadges();
}
setInterval(async () => {
	console.log("[LOG] Auto updating badges")
	await getAllBadges()
}, 60 * 60 * 1000);
getAllBadges()

module.exports = {
	validate(client, message) {
		return true;
	},
	/**
	 * @param  {Discord.Client} client
	 * @param  {Discord.Message} message
	 * @param  {Array} args
	 */
	run: (client, message, args, LOCALE) => {
		return new Promise(async(resolve, reject)=>{
			message.channel.startTyping();
			setTimeout(() => {
				message.channel.stopTyping();
			}, 5000);

			let user;
			if (message.mentions.users.size > 0) {
				user = message.mentions.users.entries().next().value[1]
			}else{
				user = message.author
			}

			let profile;
			if(await utils.Profile.hasProfile(client, user.id)){
				profile = await utils.Profile.getProfile(client, user.id)
				if(!(profile.aboutme) || profile.aboutme == ""){
					profile["aboutme"] = LOCALE.stardard.aboutme
					await utils.Profile.setTag(client, user.id, "aboutme",LOCALE.stardard.aboutme)
				}
			}else{
				await utils.Profile.setProfile(client, user.id, "https://i.imgur.com/MbGPZQR.png",LOCALE.stardard.aboutme, 0, 0)
				profile = await utils.Profile.getProfile(client,user.id)

			}

			var avatar = user.avatarURL({
				format: "png"
			})

			var badgeList = []
			if(!profile.badges) profile.badges = []
			for(var badgeId in profile.badges.sort()){
				var badge = allBadges.find(elm=>elm.id==badgeId)
				if(badge != null) badgeList.push(badge)
			}
			profile.badges = badgeList;
			if(avatar==null) avatar="https://i.imgur.com/ACByvW9.png"

			ImageProcessor(avatar, user,profile, LOCALE.profile)
			.then((image)=>{
				const embed = new Discord.MessageEmbed()
				.setColor('#9d65c9')
				.setTitle(LOCALE.message.title.interpolate({author: user.username}))
				.setDescription("Background Photo by Unsplash")
				.setAuthor(client.user.username)
				.attachFiles(image)
				.setImage("attachment://image.png")
				message.channel.stopTyping()
				resolve(message.channel.send(embed))
			})
			.catch((err)=>{
				reject(err)
			})
		})
	},

	get command() {
		return {
			name: 'profile',
			aliases: [
			]
		};
	},
};