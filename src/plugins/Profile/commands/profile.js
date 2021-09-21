const Discord = require('discord.js');
const Utils = require("./../../../utils/utils")
const fs = require("fs")

var allBadges = [];

async function getAllBadges(){
	try {
		allBadges = await Utils.Profile.getBadges();
	} catch (error) {
		setTimeout(() => {
			getAllBadges()
		}, 60 * 1000);
	}
}

getAllBadges()

setInterval(async () => {
	console.log("[LOG] Auto updating badges")
	await getAllBadges()
}, 24 * 60 * 60 * 1000);


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
			;
			

			let user;
			if (message.mentions.users.size > 0) {
				user = message.mentions.users.entries().next().value[1]
			}else{
				user = message.author
			}

			let profile;
			if(await Utils.Profile.hasProfile(client, user.id)){
				profile = await Utils.Profile.getProfile(client, user.id)
				if(!(profile.aboutme) || profile.aboutme == ""){
					profile["aboutme"] = LOCALE.stardard.aboutme
					await Utils.Profile.setTag(client, user.id, "aboutme",LOCALE.stardard.aboutme)
				}
			}else{
				await Utils.Profile.setProfile(client, user.id, "https://i.imgur.com/MbGPZQR.png",LOCALE.stardard.aboutme, 0, 0)
				profile = await Utils.Profile.getProfile(client,user.id)
			}

			var avatar = user.avatarURL({
				format: "jpg",
				size: 512
			})

			var badgeList = []
			if(!profile.badges) profile.badges = []
			for(var badgeId of profile.badges.sort()){
				var badge = allBadges.find(elm=>elm.id==badgeId)
				if(badge != null) badgeList.push(badge)
			}

			profile.badges = badgeList;
			if(avatar==null) avatar="https://i.imgur.com/ACByvW9.png"
			if(!profile.money) profile.money=0

			profile.level = Utils.XP2LV(profile.points)
			profile.username = user.username
			profile.tag = user.tag

			Utils.KarinnaAPI.get("/v1/image/profile", {
				img_url: avatar,
				profile: JSON.stringify(profile)

			}).then(async res=>{
				
				return resolve(message.inlineReply(new Discord.MessageAttachment(res, "image.jpg")))
			})
			.catch(async err=>{
				
				return reject(err)
			})
		})
	},

	get command() {
		return {
			name: 'profile',
			aliases: [
				"perfil"
			]
		};
	},
};