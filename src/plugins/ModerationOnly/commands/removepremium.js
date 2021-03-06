"use strict";
const Discord = require('discord.js');
const Utils = require("./../../../utils/utils")
const config = require("./../../../config");
require('dotenv/config');
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
        return new Promise(async (resolve, reject)=>{
            if(!config.specialusers.includes(message.author.id)){
                return message.channel.send("Sorry you can not send this command.")
            }

            const tagged_user = message.mentions.users.entries().next()
            var user;
            if (tagged_user.value){
                user = tagged_user.value[1];
            }else{
                return message.channel.send("Você precisa marcar alguém pra remover o premium, fi.")
            }

            Utils.Profile.setTag({},user.id, "status", "")
            .then(()=>{
                return message.channel.send("Premium removido com sucesso.")
            })
            .catch(()=>{
                return message.channel.send("Ocorreu um erro.")
            })

        })
    },
    get command() {
        return {
            name: "removepremium",
            aliases: [
                "rmvpremium"
            ]
        }
    },
};