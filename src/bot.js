"use strict";

const cache = require('memory-cache');
require('dotenv/config');
const fs = require('fs-extra');
const colors = require('colors');

const Discord = require('discord.js');
require("./utils/ExtendedMessage");
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
client.userBanList = new Discord.Collection();

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

	for (var controllerName of pluginsFiles) {
		try {
			console.log(`[plugin-loader] Loading ${controllerName}`.yellow)
			const main = require(`./plugins/${controllerName}/${controllerName}.js`);
			const commandList = await fs.readdir(`${__dirname}/plugins/${controllerName}/${main.commands.path}/`)
			for (var element of commandList) {
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

	// const PodcastNotify = require("./plugins/Notify/utils/PodcastNotification")
	// PodcastNotify.run(30 * 60 * 1000)
	
	
	const GameSaleClass = require("./plugins/Notify/utils/GameSale")
	const GameSale = new GameSaleClass()

	async function updateListeners() {
		let listeners = []
		const dbListeners = await Utils.GameOffers.getAllListeners()
		for (var channel in dbListeners) {
			listeners.push(channel)
		}
		return listeners;
	}

	const Music = require('./plugins/Music/utils/Music');
	Music.authorizeSpotify()
	setInterval(() => {
		Music.authorizeSpotify()
	}, 2500 * 1000)

	client.userBanList = await Utils.Ban.getBanList()

	setInterval(async () => {
		const t1 = (new Date()).getTime()

		if (process.env.NODE_ENV != "development" || true) {
			for (const user of client.cachedPoints) {
				try {
					var userInfo = {
						userId: user[0],
						points: user[1]
					}
					if (await Utils.Profile.hasProfile(client, userInfo.userId)) {
						const userProfile = await Utils.Profile.getProfile(client, userInfo.userId);
						var sumOfPoints = (parseFloat((userProfile).points) + parseFloat(userInfo.points)).toFixed(2)

						if (Utils.XP2LV(sumOfPoints) - Utils.XP2LV(parseFloat((userProfile).points)) >= 1) {
							await client.emit("nextLevel", {
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


		// CHECKS IMAGE API STATUS

		axios.get(process.env.KARINNA_API_PATH)
			.then(res => {})
			.catch(err => {
				console.log(`[IMAGE API LOG] API IS OFF:`);
			})
		client.userBanList = await Utils.Ban.getBanList()
	}, process.env.UPLOAD_CACHED_POINTS_COOLDOWN ? process.env.UPLOAD_CACHED_POINTS_COOLDOWN : 1000 * 60 * 60 * 24)

	client.login(process.env.DISCORD_API)

	async function setActv() {
		var activities = (await axios.get(process.env.GIST_URL)).data.split("\n")
		var activity = Utils.choice(activities)
		client.user.setActivity({
			name: activity
		})
	}


	client.on("ready", async () => {
		async function init_GameOffers() {
			await GameSale.init()
			let listeners = await updateListeners()
			setInterval(async () => {
				listeners = await updateListeners()
			}, 12 * 60 * 60 * 1000)
			console.log(" [NOTIFY] ".bgMagenta.black.bold, "GameSales loaded".cyan);

			GameSale.run(30 * 60 * 1000)

			GameSale.EventEmitter.on("newGames", async (newGames) => {
				console.log("New games!".green);
				for (var channelId of listeners) {
					try {
						var channel = client.channels.cache.find(channel => channel.id == channelId)
						if (!channel) {
							await Utils.GameOffers.removeChannel(channelId)
							continue;
						}
						await channel.send(new Discord.MessageEmbed()
							.setAuthor("🎮 New game")
							.setTitle(`${newGames.title}`)
							.setDescription(`**[${newGames.store.name} - ${newGames.price} (${newGames.price_cut}% OFF)](${newGames.store.href})**`)
							.setFooter("Please, check the website before buying.")
						)
					} catch (error) {
						console.log(error);
					}
				}
				console.log(`${listeners.length} channels notified`);
			})
		}
		try {
			if (process.env.NODE_ENV != "development") init_GameOffers()
		} catch (error) {
			console.log("[GameOffers]", error);
		}

		setActv()
		setInterval(async () => {
			setActv()
		}, process.env.ACTIVITY_UPDATE_COOLDOWN)
		process.env.SHARD_ID = client.shard.ids[0]

		const Topgg = require('@top-gg/sdk')
		const api = new Topgg.Api(process.env.TOPGG_API)
		const Payment = require("./libs/Payment")

		var lastVotes = []

		lastVotes = (await api.getVotes()).slice(0, 3)

		setInterval(async () => {
			const lv = (await api.getVotes()).slice(0, 3)

			if (JSON.stringify(lastVotes) != JSON.stringify(lv)) {
				lastVotes = (await api.getVotes()).slice(0, 3)
				try {
					const prize = Utils.random(450, 550);
					var fetchUser = await client.users.fetch(lastVotes[0].id)
					if (!fetchUser) return;
					fetchUser.send(new Discord.MessageEmbed().setTitle(`:star2: Obrigado por votar no Xurumin! :star2:`).setDescription(`\nComo recompensa, você ganhou **X$${prize}**!\n(você pode usar \`x!profile\` em um servidor para ver quantos X$ você tem)\n\nContinue votando para ganhar mais!`).setColor("#9d65c9"))
					await Payment.fastPayXurumin(lastVotes[0].id, prize)
				} catch (error) {
					console.log(error);
				}
			}
		}, 5000);



		console.log(`I'm alive babe as shard ${client.shard.ids[0]}`)
		console.log(`Total commands: ${client.commands.size}`);
	});
}
init();