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
                return message.send_("Sorry you can not send this command.")
            }

            const tagged_user = message.mentions.users.entries().next()
            var user;
            if (tagged_user.value){
                user = tagged_user.value[1];
            }else{
                return message.send_("Você precisa marcar alguém pra dar o banir, fi.")
            }

            if(args[0] == "ban"){
                var isBanned = await Utils.Ban.isBanned(user.id)
                if(isBanned) return message.send_("User is already banned.")
                Utils.Ban.setBan(user.id)
                .then(()=>{
                    return message.send_("Usuário banido com sucesso.")
                })
                .catch(()=>{
                    return message.send_("Ocorreu um erro.")
                })
            }else if(args[0] == "unban"){
                Utils.Ban.removeBan(user.id)
                .then(()=>{
                    return message.send_("Ban removido.")
                })
                .catch(()=>{
                    return message.send_("Ocorreu um erro.")
                })
            }else{
                return message.send_("`ban` or `unban`")
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