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
                return message.channel.send("Você precisa marcar alguém pra dar o banir, fi.")
            }

            if(args[0] == "ban"){
                var isBanned = await Utils.Ban.isBanned(user.id)
                if(isBanned) return message.channel.send("User is already banned.")
                Utils.Ban.setBan(user.id)
                .then(()=>{
                    return message.channel.send("Usuário banido com sucesso.")
                })
                .catch(()=>{
                    return message.channel.send("Ocorreu um erro.")
                })
            }else if(args[0] == "unban"){
                Utils.Ban.removeBan(user.id)
                .then(()=>{
                    return message.channel.send("Ban removido.")
                })
                .catch(()=>{
                    return message.channel.send("Ocorreu um erro.")
                })
            }else{
                return message.channel.send("`ban` or `unban`")
            }
        })
    },
    get command() {
        return {
            name: "ban",
            aliases: []
        }
    },
};