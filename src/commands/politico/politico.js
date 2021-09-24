const Discord = require('discord.js');
const database = require("./../../utils/database");
const Utils = require("./../../utils/utils");
const fs = require("fs");

const slogan_part_1 = [
	"Por um Brasil mais",
	"Por uma nação mais",
	"Por uma putaria mais",
	"Pelo puteiro do bairro mais",
	"Pela propina mais"
];

const slogan_part_2 = [
	"bonito(a)",
	"cheiroso(a)",
	"maravilhoso(a)",
	"maior",
	"daora",
	"junin coelho doido"
];

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
		const slogan = `${slogan_part_1[Math.floor(Math.random() * slogan_part_1.length)]} ${slogan_part_2[Math.floor(Math.random() * slogan_part_2.length)]}`;
		const num_list = "0️⃣ 1️⃣ 2️⃣ 3️⃣ 4️⃣ 5️⃣ 6️⃣ 7️⃣ 8️⃣ 9️⃣".split(" ");
		let numbers = "";
		for(let i = 0; i <= 3; i++){
			numbers += " "+num_list[Math.floor(Math.random() * num_list.length)];
		}
		const emoji_list = "😏 😁 🤠 😎 🤩 🥳 🤑 🤩 🥳".split(" ");


		if (message.mentions.users.size > 0) {
			let user = message.mentions.users.entries().next().value[1];

			return message.send_(
				new Discord.MessageEmbed()
				.setAuthor("Horário político eleitoral")
				.setDescription(`**👉 ${slogan}\n${emoji_list[Math.floor(Math.random() * emoji_list.length)]} Vote ${user.username}.\n👋 Vote ${numbers}**`)
				.setThumbnail(user.avatarURL())
			);

		} else {
			let user = message.author;
			
			return message.send_(
				new Discord.MessageEmbed()
				.setAuthor("Horário político eleitoral")
				.setDescription(`**👉 ${slogan}\n${emoji_list[Math.floor(Math.random() * emoji_list.length)]} Vote ${user.username}.\n👋 Vote ${numbers}**`)
				.setThumbnail(user.avatarURL())
			);
		}

	},

	get command() {
		return {
			name: 'politico'
		};
	},
};