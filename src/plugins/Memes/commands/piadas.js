"use strict";

const Discord = require('discord.js');
const utils = require('./../../../utils/utils');

const JokeList = require("./../files/piadas/piadas.json").features;

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
        return new Promise((resolve, reject) => {

            var joke = utils.choice(JokeList).properties;

            var msg = {
                title: LOCALE["message"].title,
                description: LOCALE["message"].description.interpolate({
                    question:joke.pergunta,
                    answer: joke.resposta
                })
            };
            return resolve(message.send_(
                utils.createSimpleEmbed(msg.title, msg.description)
            ));

        });
    },
    get command() {
        return {
            name: 'piadas',
            aliases: [
                "jokes",
                "piada"
            ]
        };
    },
};