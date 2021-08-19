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
            var language = "pt"

            if(args[0]) language = args[0];

            var isDeleted = false;

            message.send_Typing();
            

            var msg = {
                title: LOCALE["question"].title,
                loading: LOCALE["question"].loading
            }
            var question = await EitherGame.getQuestion(Utils.random(0, 5000), language)
            var main_embed = new Discord.MessageEmbed()

            main_embed.setTitle(msg.title)
            main_embed.setThumbnail("https://i.imgur.com/J9Cz6fC.png")
            main_embed.addField(`🟦 ${question.blue_choice.question}`, "⠀", false)
            main_embed.addField(`🟥 ${question.red_choice.question}`, "⠀", false)
            var main_msg = await message.send_(main_embed)
            


            EitherGame.Reactions.reactEmbed(main_msg, message.author.id, async (reaction) => {
                    /** 
                     * 0 = 🟦
                     * 1 = 🟥
                     * 2 = ❌
                     */
                    if(isDeleted) return;
                    if(reaction == 2){
                        await main_msg.delete()
                        isDeleted = true
                        var embed = new Discord.MessageEmbed()
                        embed.setTitle(msg.title)
                        embed.setThumbnail("https://i.imgur.com/J9Cz6fC.png")
                        embed.setDescription(LOCALE["finished"].description)
                        message.send_(embed)
                        
                        return resolve()
                    }
                    var blue_percentage = (question.blue_choice.percentage*100).toFixed(0)
                    var red_percentage = (question.red_choice.percentage * 100).toFixed(0)


                    if(blue_percentage == 0 || red_percentage == 0 || !question.blue_choice.percentage){
                        blue_percentage = Utils.random(35,60)
                        red_percentage = 100-blue_percentage
                    }

                    var blue_question;
                    var red_question;

                    if(blue_percentage > red_percentage){
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
                    await main_msg.edit(main_embed)

                    setTimeout(async ()=>{
                        if(isDeleted){
                            return;
                        }
                        var new_embed = new Discord.MessageEmbed()

                        new_embed.setTitle(msg.title)
                        new_embed.setThumbnail("https://i.imgur.com/J9Cz6fC.png")
                        new_embed.addField(`🟦 ${question.blue_choice.question}`, "⠀", false)
                        new_embed.addField(`🟥 ${question.red_choice.question}`, "⠀", false)

                        main_msg.edit(new_embed)

                    }, 5000)
                    question = await EitherGame.getQuestion(Utils.random(0, 5000), language)
                })
                .then(async() => {
                    if(isDeleted) return;
                    await main_msg.delete()
                    isDeleted = true

                    var embed = new Discord.MessageEmbed()
                    embed.setTitle(msg.title)
                    embed.setThumbnail("https://i.imgur.com/J9Cz6fC.png")
                    embed.setDescription(LOCALE["finished"].description)
                    message.send_(embed)
                    return resolve()
                })
                .catch(async(err) => {
                    if(isDeleted) return;
                    await main_msg.delete()
                    isDeleted = true

                    var embed = new Discord.MessageEmbed()
                    embed.setTitle(LOCALE["errors"]["something_went_wrong"].title)
                    embed.setThumbnail("https://i.imgur.com/J9Cz6fC.png")
                    embed.setDescription(LOCALE["errors"]["something_went_wrong"].description)
                    message.send_(embed)
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