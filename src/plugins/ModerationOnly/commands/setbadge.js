"use strict";
const Discord = require('discord.js');
const Utils = require("./../../../utils/utils");
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
                return message.send_("Sorry you can not send this command.");
            }

            const tagged_user = message.mentions.users.entries().next();
            var user;
            if (tagged_user.value){
                user = tagged_user.value[1];
            }else{
                return message.send_("Você precisa marcar alguém pra dar o premium, fi.");
            }
            if(!args[1]){
                return message.send_("Precisa colocar as badges, po! E separar elas por `,`");
            }

            Utils.Profile.setTag({},user.id, "badges", args[1].split(","))
            .then(()=>{
                return message.send_("Badge dada com sucesso.");
            })
            .catch(()=>{
                return message.send_("Ocorreu um erro.");
            });

        });
    },
    get command() {
        return {
            name: "setbadge",
            aliases: []
        };
    },
};