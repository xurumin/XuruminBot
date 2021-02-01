"use strict";
const cache = require('memory-cache');
require('dotenv/config');
const fs = require('fs-extra');


const Discord = require('discord.js');
const client = new Discord.Client();


client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();
client.playlist = new Discord.Collection();
client.players = new Discord.Collection();
const init = async () => {

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

			client.on(props.event.eventName, (data)=>{props.run(client, data)});

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

	

	client.login(process.env.DISCORD_API)
	client.on("ready", () => {
		const DBL = require("dblapi.js");
		const dbl = new DBL(process.env.TOPGG_API, client);

		dbl.on('posted', () => {
			console.log('Server count posted!');
		})
		
		dbl.on('error', e => {
		console.log(`Oops! ${e}`);
		})

		function postDBL(){
			dbl.postStats(client.guilds.size, client.shard.ids[0]);
		}
		postDBL()
		setInterval(async () => {
			postDBL()
		}, 1800000);

		client.user.setActivity({
			name: `Precisa de ajuda? ${process.env.COMMAND_PREFIX}help`
		})
		process.env.SHARD_ID = client.shard.ids[0]
		console.log(`I'm alive babe as shard ${client.shard.ids[0]}`)
	});
}
init();