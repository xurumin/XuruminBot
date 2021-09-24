const Discord = require('discord.js');

function segParaHora(time) {
	let hours = Math.floor(time / 3600);
	let minutes = Math.floor((time % 3600) / 60);
	let seconds = time % 60;

	minutes = minutes < 10 ? '0' + minutes : minutes;
	seconds = seconds < 10 ? '0' + seconds : seconds;

	return `${hours} hora(s), ${minutes} minuto(s) e ${Math.round(seconds)} segundo(s)`;
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
	run: async (client, message, args) => {
		return message.send_(`Oi! Estou online a ${segParaHora(client.uptime/1000)}`);
	},

	get command() {
		return {
			name: 'uptime'
		};
	},
};