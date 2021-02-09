"use strict";
const cache = require('memory-cache');
require('dotenv/config');
const fs = require('fs-extra');


const Discord = require('discord.js');
const utils = require('./utils/utils');
const client = new Discord.Client();


client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();
client.playlist = new Discord.Collection();
client.players = new Discord.Collection();
client.profiles = new Discord.Collection();
client.cachedPoints = new Discord.Collection();

const LOCALES = new Discord.Collection();

const init = async () => {

	/** 
	 * IMPORTING LOCALES
	 */

	const locales = await fs.readdir('src/locales')

	console.log(
		'[#LOG]',
		`Loading ${locales.length} locale(s).`
	);

	locales.forEach(async (localeFileName) => {
		try {
			const localeName = localeFileName.split(".")[0]

			const localeFile = JSON.parse(fs.readFileSync(__dirname+`/locales/${localeFileName}`).toString());

			LOCALES.set(localeName, localeFile)

			console.log(`	> LOCALE ${localeName} loaded.`)
		} catch (error) {
			console.log(`[#ERROR] Could not load locale ${localeFileName}:`);
			console.error(error)
		}
	})

	/** 
	 * IMPORTING COMMANDS
	 */

	const cmdFiles = await fs.readdir('src/commands/')

	console.log(
		'[#LOG]',
		`Loading ${cmdFiles.length} command(s).`
	);

	cmdFiles.forEach(async (cmdFolder) => {
		try {
			const command = require(`./commands/${cmdFolder}/${cmdFolder}.js`);

			client.commands.set(command.command.name, command);
			if(command.command.aliases && command.command.aliases != []){
				command.command.aliases.forEach(aliase => {
					client.aliases.set(aliase, command.command.name);
				});
			}
			console.log(`	> Command ${command.command.name} loaded.`)
		} catch (error) {
			console.log(`[#ERROR] Could not load command ${cmdFolder}:`);
			console.error(error)
		}
	})

	/** 
	 * IMPORTING EVENTS
	 */
	const evntFiles = await fs.readdir('src/events/')

	console.log(
		'[#LOG]',
		`Loading ${evntFiles.length} events(s).`
	);

	evntFiles.forEach(async (eventName) => {
		try {
			const props = require(`./events/${eventName}`);
			console.log(`[event-loader] ${props.event.eventName} loaded.`)

			client.on(props.event.eventName, (data)=>{props.run(client, data, LOCALES)});

		} catch (error) {
			console.log(`[#ERROR] Could not load command ${eventName}:`);
			console.error(error)
		}
	})

	/** 
	 * IMPORTING PLUGINS
	 */
	const controllersFiles = await fs.readdir('src/plugins/')

	console.log(
		'[#LOG]',
		`Loading ${controllersFiles.length} plugin(s).`
	);

	controllersFiles.forEach(async (controllerName) => {
		try {
			const main = require(`./plugins/${controllerName}/${controllerName}.js`);
			console.log(`[plugin-loader] loading ${controllerName} commands...`)
			const commandList = await fs.readdir(`${__dirname}/plugins/${controllerName}/${main.commands.path}/`)
			commandList.forEach(element => {
				const command = require(`${__dirname}/plugins/${controllerName}/${main.commands.path}/${element}`);
				client.commands.set(command.command.name, command);
				if(command.command.aliases && command.command.aliases != []){
					command.command.aliases.forEach(aliase => {
						client.aliases.set(aliase, command.command.name);
					});
				}
				console.log(`	> Command ${command.command.name} loaded.`)
			});
			console.log(`[plugin-loader] ${controllerName} loaded.`)

		} catch (error) {
			console.log(`[#ERROR] Could not load command ${controllerName}:`);
			console.error(error)
		}
	})

	const Music = require('./plugins/Music/utils/Music');
	Music.authorizeSpotify()
	setInterval(()=>{
		Music.authorizeSpotify()
	}, 2500 * 1000 )

	setInterval(async ()=>{
		console.log(`[LOG] Uploading cached points of ${client.cachedPoints.size} users`)
		const t1 = (new Date()).getTime()
		for (const user of client.cachedPoints) {
			try {
				var userInfo = {
					userId:user[0],
					points: user[1]
				}
				if(await utils.Profile.hasProfile(client, userInfo.userId)){
					var sumOfPoints = (parseFloat((await utils.Profile.getProfile(client, userInfo.userId)).points) + parseFloat(userInfo.points)).toFixed(2)
					await utils.Profile.setTag(client, userInfo.userId, "points", sumOfPoints)
				}else{
					var standard_profile = utils.Profile.getStandardProfile()
					await utils.Profile.setProfile(client, userInfo.userId,standard_profile.bg_url,standard_profile.aboutme,standard_profile.level, userInfo.points)
				}
			} catch (error) {
				console.log(error)
			}
		}
		const t2 = (new Date()).getTime()
		console.log(`It took ${((t2-t1)/1000).toFixed(2)} secs`)
		client.cachedPoints.clear()
	}, 10 * 60 * 1000 )
	// 5MINUTES = 5* 60 * 1000
	

	client.login(process.env.DISCORD_API)
	client.on("ready", () => {
		client.user.setActivity({
			name: `Precisa de ajuda? ${process.env.COMMAND_PREFIX}help`
		})
		process.env.SHARD_ID = client.shard.ids[0]
		console.log(`I'm alive babe as shard ${client.shard.ids[0]}`)
	});
}
init();