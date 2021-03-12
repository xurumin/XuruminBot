const Discord = require('discord.js');
const Utils = require("./../../utils/utils")
const axios = require("axios").default;
const Payment = require("./../../libs/Payment")
var url = require('url');

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
		if(args.length <= 0){
			return message.channel.send(
                Utils.createSimpleEmbed(LOCALE.errors.cmd_format.title, LOCALE.errors.cmd_format.description.interpolate({prefix: process.env.COMMAND_PREFIX}))
            );
		}

		if((!args[0].includes("https://i.imgur.com/") && !url.parse(args[0]).host.includes(i.imgur.com)) || ((!args[0].endsWith(".png")) && (!args[0].endsWith(".jpg"))) ){
			return message.channel.send(
                Utils.createSimpleEmbed(LOCALE.errors.cmd_format.title, LOCALE.errors.cmd_format.description.interpolate({prefix: process.env.COMMAND_PREFIX}))
            );
		}
		try {
			var bg = await axios.request({method: "head", url: `${args[0]}`})
			var fileSize = bg.headers["content-length"]
			if( (fileSize/1024) > 250 ){
				return message.channel.send(
					Utils.createSimpleEmbed(LOCALE.errors.max_file_size_exceeded.title, LOCALE.errors.max_file_size_exceeded.description.interpolate({prefix: process.env.COMMAND_PREFIX}))
				);
			}
		} catch (error) {
			return message.channel.send(
                Utils.createSimpleEmbed(LOCALE.errors.invalid_url.title, LOCALE.errors.invalid_url.description.interpolate({prefix: process.env.COMMAND_PREFIX}))
            );
		}


		//check operation

		var confirmation_msg = {
			title: LOCALE["confirmation"][0].title,
			description: LOCALE["confirmation"][0].description
		}
		var operation_refused_msg = {
			title: LOCALE["confirmation"][1].title
		}
		var msg = await message.channel.send(Utils.createSimpleEmbed(confirmation_msg.title,confirmation_msg.description))
		Utils.Reactions.getConfirmation(
			msg, message.author.id
		).then(async (value)=>{
			await msg.delete()
			if(!value){
				return await message.channel.send(Utils.createSimpleEmbed(operation_refused_msg.title,""))
			}
			Payment.fastPay(message.author.id, 100)
			.then(async (pmtResponse)=>{
				message.author.send(LOCALE.pv_message.interpolate({
					transaction_id: pmtResponse.id,
					creation_time: pmtResponse.create_time,
					payer: pmtResponse.payerId,
					payee: client.user.username,
					value: pmtResponse.value,
				}))
				
				if(await Utils.Profile.hasProfile(client, message.author.id)){
					await Utils.Profile.setTag(client, message.author.id, "bg_url", `${args[0]}`)
					return message.channel.send(
						Utils.createSimpleEmbed(LOCALE.message.title, LOCALE.message.description.interpolate({prefix: process.env.COMMAND_PREFIX}))
					);
				}else{
					var standard_profile = Utils.Profile.getStandardProfile()
					await Utils.Profile.setProfile(client, message.author.id,`${args[0]}`,standard_profile.aboutme,standard_profile.level, standard_profile.points)
		
					return message.channel.send(
						Utils.createSimpleEmbed(LOCALE.message.title, LOCALE.message.description.interpolate({prefix: process.env.COMMAND_PREFIX}))
					);
				}

			}).catch(async (err)=>{
				if(err.status && err.status==100){
					var user_do_not_have_funds = {
						title: LOCALE["errors"]["user_do_not_have_funds"].title,
						description: LOCALE["confirmation"]["user_do_not_have_funds"].description
					}
					return await message.channel.send(Utils.createSimpleEmbed(user_do_not_have_funds.title,user_do_not_have_funds.description))
				}else{
					var error_occurred= {
						title: LOCALE["errors"]["error_occurred"].title,
						description: LOCALE["confirmation"]["error_occurred"].description
					}
					return await message.channel.send(Utils.createSimpleEmbed(error_occurred.title,error_occurred.description))
				}
			})
		})
		.catch(async (err)=>{
			console.log(err);
			return await message.channel.send(Utils.createSimpleEmbed(operation_refused_msg.title,""))
		})
	},

	get command() {
		return {
			name: 'setbackground',
			aliases:[
				"setbg"
			]
		}
	},
};