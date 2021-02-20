"use strict";
const cache = require('memory-cache');
require('dotenv/config');
const fs = require('fs-extra');

const Discord = require('discord.js');
const utils = require('./utils/utils');
const {
	default: axios
} = require('axios');

const client = new Discord.Client();


client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();
client.playlist = new Discord.Collection();
client.players = new Discord.Collection();
client.profiles = new Discord.Collection();
client.commandsSent = 0;
client.cachedPoints = new Discord.Collection();

const LOCALES = new Discord.Collection();

const init = async () => {

	if (process.env.ONLY_PLUGINS_MODE == "true") console.log("[LOG] ONLY PLUGINS MODE ON")

	/** 
	 * IMPORTING LOCALES
	 */

	var locales = await fs.readdir('src/locales')

	console.log(
		'[#LOG]',
		`Loading ${locales.length} locale(s).`
	);

	locales.forEach(async (localeFileName) => {
		try {
			const localeName = localeFileName.split(".")[0]

			const localeFile = JSON.parse(fs.readFileSync(__dirname + `/locales/${localeFileName}`).toString());

			LOCALES.set(localeName, localeFile)

			console.log(`	> LOCALE ${localeName} loaded.`)
		} catch (error) {
			console.log(`[#ERROR] Could not load locale ${localeFileName}:`);
			console.error(error)
		}
	})
	locales = []

	/** 
	 * IMPORTING COMMANDS
	 */

	var cmdFiles = await fs.readdir('src/commands/')
	if (process.env.ONLY_PLUGINS_MODE == "true") {
		cmdFiles = []
	}

	console.log(
		'[#LOG]',
		`Loading ${cmdFiles.length} command(s).`
	);

	cmdFiles.forEach(async (cmdFolder) => {
		try {
			const command = require(`./commands/${cmdFolder}/${cmdFolder}.js`);

			client.commands.set(command.command.name, command);
			if (command.command.aliases && command.command.aliases != []) {
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
	cmdFiles = []

	/** 
	 * IMPORTING EVENTS
	 */
	var evntFiles = await fs.readdir('src/events/')

	console.log(
		'[#LOG]',
		`Loading ${evntFiles.length} events(s).`
	);

	evntFiles.forEach(async (eventName) => {
		try {
			const props = require(`./events/${eventName}`);
			console.log(`[event-loader] ${props.event.eventName} loaded.`)

			client.on(props.event.eventName, (data) => {
				props.run(client, data, LOCALES)
			});

		} catch (error) {
			console.log(`[#ERROR] Could not load command ${eventName}:`);
			console.error(error)
		}
	})
	evntFiles = []

	/** 
	 * IMPORTING PLUGINS
	 */
	var pluginsFiles = await fs.readdir('src/plugins/')

	console.log(
		'[#LOG]',
		`Loading ${pluginsFiles.length} plugin(s).`
	);

	pluginsFiles.forEach(async (controllerName) => {
		try {
			console.log(`[plugin-loader] Loading ${controllerName}`)
			const main = require(`./plugins/${controllerName}/${controllerName}.js`);
			console.log(`[plugin-loader] loading ${controllerName} commands...`)
			const commandList = await fs.readdir(`${__dirname}/plugins/${controllerName}/${main.commands.path}/`)
			commandList.forEach(element => {
				const command = require(`${__dirname}/plugins/${controllerName}/${main.commands.path}/${element}`);
				client.commands.set(command.command.name, command);
				if (command.command.aliases && command.command.aliases != []) {
					command.command.aliases.forEach(aliase => {
						client.aliases.set(aliase, command.command.name);
					});
				}
				console.log(`	> Command ${command.command.name} loaded.`)
			});
		} catch (error) {
			console.log(`[#ERROR] Could not load command ${controllerName}:`);
			console.error(error)
		}
	})
	pluginsFiles = []

	const Music = require('./plugins/Music/utils/Music');
	Music.authorizeSpotify()
	setInterval(() => {
		Music.authorizeSpotify()
	}, 2500 * 1000)

	setInterval(async () => {
		console.log(`[LOG] Uploading cached points of ${client.cachedPoints.size} users`)
		const t1 = (new Date()).getTime()

		if (process.env.NODE_ENV == "development") {
			console.log("[LOG] DEV MOD ON. NO POINTS WERE UPLOADED")
			client.cachedPoints.clear()
		}

		for (const user of client.cachedPoints) {
			try {
				var userInfo = {
					userId: user[0],
					points: user[1]
				}
				if (await utils.Profile.hasProfile(client, userInfo.userId)) {
					var sumOfPoints = (parseFloat((await utils.Profile.getProfile(client, userInfo.userId)).points) + parseFloat(userInfo.points)).toFixed(2)
					await utils.Profile.setTag(client, userInfo.userId, "points", sumOfPoints)
				} else {
					var standard_profile = utils.Profile.getStandardProfile()
					await utils.Profile.setProfile(client, userInfo.userId, standard_profile.bg_url, standard_profile.aboutme, standard_profile.level, userInfo.points)
				}
			} catch (error) {
				console.log(error)
			}
		}

		utils.BotDB.setBotInfo(client.commandsSent + parseInt(await utils.BotDB.getSentCmds()))

		const t2 = (new Date()).getTime()
		console.log(`It took ${((t2-t1)/1000).toFixed(2)} secs`)

		client.cachedPoints.clear()
		client.commandsSent = 0;
	}, process.env.UPLOAD_CACHED_POINTS_COOLDOWN)

	client.login(process.env.DISCORD_API)

	async function setActv() {
		var activities = (await axios.get(process.env.GIST_URL)).data.split("\n")
		var activitie = utils.choice(activities)
		client.user.setActivity({
			name: activitie
		})
	}

	client.on("ready", () => {
		setActv()
		setInterval(async () => {
			setActv()
		}, process.env.ACTIVITY_UPDATE_COOLDOWN)
		process.env.SHARD_ID = client.shard.ids[0]
		console.log(`I'm alive babe as shard ${client.shard.ids[0]}`)
	});
}
init();