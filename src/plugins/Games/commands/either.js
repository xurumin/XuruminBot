"use strict";

const Discord = require('discord.js');
const Utils = require("./../../../utils/utils")
const EitherGame = require("./../utils/either/EitherGame")
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
        return new Promise(async (resolve, reject) => {

            message.channel.startTyping()
            setTimeout(() => {
                message.channel.stopTyping();
            }, 5000);

            var msg = {
                title: LOCALE["question"].title,
                loading: LOCALE["question"].loading
            }
            var question = await EitherGame.getQuestion(Utils.random(0, 5000))
            var main_embed = new Discord.MessageEmbed()

            main_embed.setTitle(msg.title)
            main_embed.setThumbnail("https://i.imgur.com/J9Cz6fC.png")
            main_embed.addField(`🟦 ${question.blue_choice.question}`, "⠀", false)
            main_embed.addField(`🟥 ${question.red_choice.question}`, "⠀", false)
            var main_msg = await message.channel.send(main_embed)
            message.channel.stopTyping();

            EitherGame.Reactions.reactEmbed(main_msg, async (reaction) => {
                    /** 
                     * 0 = 🟦
                     * 1 = 🟥
                     * 2 = ❌
                     */
                    if(reaction == 2){
                        main_embed.fields = []
                        main_embed.setDescription(LOCALE["finished"].description)
                        return main_msg.edit(main_embed)
                    }
                    var blue_percentage = (question.blue_choice.percentage*100).toFixed(0)
                    var red_percentage = (question.red_choice.percentage * 100).toFixed(0)


                    if(blue_percentage == 0 || red_percentage == 0 || !question.blue_choice.percentage){
                        blue_percentage = Utils.random(35,60)
                        red_percentage = 100-blue_percentage
                        console.log("rd");
                    }

                    var blue_question;
                    var red_question;

                    if(question.blue_choice.percentage > question.red_choice.percentage){
                        blue_question = `**${question.blue_choice.question}**`
                        red_question = `${question.red_choice.question}`
                    }else{
                        blue_question = `${question.blue_choice.question}`
                        red_question = `**${question.red_choice.question}**`
                    }

                    main_embed.fields[0].value = blue_question
                    main_embed.fields[1].value = red_question

                    main_embed.fields[0].name = `🟦 ${blue_percentage}%`
                    main_embed.fields[1].name = `🟥 ${red_percentage}%`

                    main_embed.setFooter(msg.loading)
                    main_msg.edit(main_embed)

                    setTimeout(async ()=>{
                        var new_embed = new Discord.MessageEmbed()

                        new_embed.setTitle(msg.title)
                        new_embed.addField(`🟦 ${question.blue_choice.question}`, "⠀", false)
                        new_embed.addField(`🟥 ${question.red_choice.question}`, "⠀", false)

                        main_msg.edit(new_embed)

                    }, 5000)
                    question = await EitherGame.getQuestion(Utils.random(0, 5000))
                })
                .then(() => {
                    var embed = new Discord.MessageEmbed()
                    embed.setTitle(msg.title)
                    embed.setDescription(LOCALE["finished"].description)
                    main_msg.edit(embed)
                    return resolve()
                })
                .catch((err) => {
                    console.log(err);
                    var embed = new Discord.MessageEmbed()
                    embed.setTitle(LOCALE["errors"]["something_went_wrong"].title)
                    embed.setDescription(LOCALE["errors"]["something_went_wrong"].description)
                    main_msg.edit(embed)
                    return reject()
                })
        })
    },
    get command() {
        return {
            name: 'either',
            aliases: [
                "wouldyourather"
            ]
        }
    },
};