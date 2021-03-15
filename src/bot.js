"use strict";
const cache = require('memory-cache');
require('dotenv/config');
const fs = require('fs-extra');
const colors = require('colors');

const Discord = require('discord.js');
const Utils = require('./utils/utils');
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
client.playingWITM = new Discord.Collection();

const LOCALES = new Discord.Collection();

const init = async () => {

	if (process.env.ONLY_PLUGINS_MODE == "true") console.log("[LOG] ONLY PLUGINS MODE ON")

	/** 
	 * IMPORTING LOCALES
	 */

	var locales = await fs.readdir('src/locales')

	console.log(
		'[#LOG]'.magenta,
		`Loading ${locales.length} locale(s).`.magenta
	);

	locales.forEach(async (localeFileName) => {
		try {
			const localeName = localeFileName.split(".")[0]

			const localeFile = JSON.parse(fs.readFileSync(__dirname + `/locales/${localeFileName}`).toString());

			LOCALES.set(localeName, localeFile)

			console.log(`	> LOCALE ${localeName.green} loaded.`)
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
		'[#LOG]'.magenta,
		`Loading ${cmdFiles.length} command(s).`.magenta
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
			console.log(`	> Command ${command.command.name.green} loaded.`)
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
		'[#LOG]'.magenta,
		`Loading ${evntFiles.length} events(s).`.magenta
	);

	evntFiles.forEach(async (eventName) => {
		try {
			const props = require(`./events/${eventName}`);
			console.log(`[event-loader] ${props.event.eventName.green} loaded.`)

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
		'[#LOG]'.magenta,
		`Loading ${pluginsFiles.length} plugin(s).`.magenta
	);

	for(var controllerName of pluginsFiles){
		try {
			console.log(`[plugin-loader] Loading ${controllerName}`.yellow)
			const main = require(`./plugins/${controllerName}/${controllerName}.js`);
			const commandList = await fs.readdir(`${__dirname}/plugins/${controllerName}/${main.commands.path}/`)
			for(var element of commandList){
				const command = await require(`${__dirname}/plugins/${controllerName}/${main.commands.path}/${element}`);
				client.commands.set(command.command.name, command);
				if (command.command.aliases && command.command.aliases != []) {
					command.command.aliases.forEach(aliase => {
						client.aliases.set(aliase, command.command.name);
					});
				}
				console.log(`	> Command ${command.command.name.green} loaded.`)
			}
		} catch (error) {
			console.log(`[#ERROR] Could not load command ${controllerName}:`);
			console.error(error)
		}
	}
	pluginsFiles = []
	
	// NOTIFIERS

	const GameSaleClass = require("./plugins/Notify/utils/GameSale")
	const GameSale = new GameSaleClass()

	async function updateListeners(){
		let listeners = []
		const dbListeners = await Utils.GameOffers.getAllListeners()
		for(var channel in dbListeners){
			listeners.push(channel)
		}
		return listeners;
	}

	const Music = require('./plugins/Music/utils/Music');
	Music.authorizeSpotify()
	setInterval(() => {
		Music.authorizeSpotify()
	}, 2500 * 1000)

	setInterval(async () => {
		const t1 = (new Date()).getTime()

		if (process.env.NODE_ENV != "development" || true) {
			//Utils.BotDB.setBotInfo(client.commandsSent + parseInt(await Utils.BotDB.getSentCmds()))

			for (const user of client.cachedPoints) {
				try {
					var userInfo = {
						userId: user[0],
						points: user[1]
					}
					if (await Utils.Profile.hasProfile(client, userInfo.userId)) {
						const userProfile = await Utils.Profile.getProfile(client, userInfo.userId);
						var sumOfPoints = (parseFloat((userProfile).points) + parseFloat(userInfo.points)).toFixed(2)

						if(Utils.XP2LV(sumOfPoints) - Utils.XP2LV(parseFloat((userProfile).points)) >= 1){
							client.emit("nextLevel", {
								userId: userInfo.userId,
								newLevel: Utils.XP2LV(sumOfPoints)
							})
						}
						await Utils.Profile.setTag(client, userInfo.userId, "points", sumOfPoints)
					} else {
						var standard_profile = Utils.Profile.getStandardProfile()
						await Utils.Profile.setProfile(client, userInfo.userId, standard_profile.bg_url, standard_profile.aboutme, standard_profile.level, userInfo.points)
					}
				} catch (error) {
					console.log(error)
				}
			};

			const t2 = (new Date()).getTime()
			console.log(`It took ${((t2-t1)/1000).toFixed(2)} secs`)
		}

		client.cachedPoints.clear()
		client.commandsSent = 0;
	}, process.env.UPLOAD_CACHED_POINTS_COOLDOWN?process.env.UPLOAD_CACHED_POINTS_COOLDOWN:1000*60*60*24)

	client.login(process.env.DISCORD_API)

	async function setActv() {
		var activities = (await axios.get(process.env.GIST_URL)).data.split("\n")
		var activitie = Utils.choice(activities)
		client.user.setActivity({
			name: activitie
		})
	}

	client.on("ready", () => {
		async function init_GameOffers(){
			await GameSale.init()
			let listeners = await updateListeners()
			setInterval(async ()=>{
				listeners = await updateListeners()
			}, 12 * 60 * 60 * 1000)
			console.log(" [NOTIFY] ".bgMagenta.black.bold, "GameSales loaded".cyan);
			GameSale.run(60 * 1000)
			GameSale.EventEmitter.on("newGames", async (newGames)=>{
				console.log("New games!".green);
				if(newGames[0].prices.length <= 0) return;
				for(var channelId of listeners){
					try {
						var channel = client.channels.cache.find(channel=>channel.id==channelId)
						if(!channel){
							await Utils.GameOffers.removeChannel(channelId)
							continue;
						}
						await channel.send(new Discord.MessageEmbed()
							.setAuthor("🎮 New game")
							.setTitle(`${newGames[0].game_name}`)
							.setDescription(`**[${newGames[0].prices[0].siteName} - ${newGames[0].prices[0].price}](${newGames[0].prices[0].url})**`)
							.setFooter("Please, check the website before buying.")
						)
					} catch (error) {
						console.log(error);
					}
				}
				console.log(`${listeners.length} channels notified`);
			})
		}
		if(process.env.NODE_ENV != "development") init_GameOffers()

		setActv()
		setInterval(async () => {
			setActv()
		}, process.env.ACTIVITY_UPDATE_COOLDOWN)
		process.env.SHARD_ID = client.shard.ids[0]
		console.log(`I'm alive babe as shard ${client.shard.ids[0]}`)
		console.log(`Total commands: ${client.commands.size}`);

		console.log(9, Utils.XP2LV(9));
		console.log(10, Utils.XP2LV(10));
		console.log(11, Utils.XP2LV(11));
		console.log(45, Utils.XP2LV(45));
		console.log(50, Utils.XP2LV(50));
		console.log(51, Utils.XP2LV(51));
		console.log(500, Utils.XP2LV(500));
	});
}
init();