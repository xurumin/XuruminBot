const {default: axios} = require("axios");
const cheerio = require('cheerio');
const Utils = require("./../../../../utils/utils");

var game = {
    getQuestion: async (id, translate=false) => {
        try {
            var data = (await axios.get(`http://either.io/${id}`, {
                timeout: 10*1000
            })).data
        } catch (error) {
            return await game.getQuestion(Utils.random(0,5000), translate)
        }
        
        const $ = cheerio.load(data);
        var questions = {
            red_choice: {
                question: $("div.red-choice div.option a").html().replace("\n", ""),
                total_votes: parseInt($("div.red-choice div.total-votes span.count").html().replace(/,/g, "")),
                percentage: 0
            },
            blue_choice: {
                question: $("div.blue-choice div.option a").html().replace("\n", ""),
                total_votes: parseInt($("div.blue-choice div.total-votes span.count").html().replace(/,/g, "")),
                percentage: 0
            },
            total_votes: 0
        }
        questions.total_votes = questions.blue_choice.total_votes + questions.red_choice.total_votes
        questions.red_choice.percentage = questions.red_choice.total_votes / questions.total_votes
        questions.blue_choice.percentage = questions.blue_choice.total_votes / questions.total_votes

        if(translate){
            questions.red_choice.question = await Utils.translate("en", "pt", questions.red_choice.question)
            questions.blue_choice.question = await Utils.translate("en", "pt",questions.blue_choice.question)
        }

        return questions;
    } ,

    Reactions: {
        async _sendRectsLight(message) {
            await message.react("🟦")
            await message.react("🟥")
            await message.react("❌")
        },
        reactEmbed(message, playerId, onReact) {
            return new Promise(async (resolve, reject) => {
                
                await game.Reactions._sendRectsLight(message)
                const filter = (reaction, user) => {
                    if(!message.embeds[0].fields[0] || !message){
                        return resolve();
                    }
                    if (["754756207507669128", "753723888671785042", "757333853529702461", message.author.id].includes(user.id) || user.id != playerId) {
                            return false;
                    }
                    switch (reaction.emoji.name) {
                        case "🟦":
                            onReact(0)
                            break;
                        case "🟥":
                            onReact(1)
                            break;
                        case "❌":
                            onReact(2)
                            break;
                        default:
                            break;
                    }
                    return true;
                };
                message.awaitReactions(filter, {
                        time: 300000,
                        max: 50
                })
                    .then(() => {
                        return resolve()
                    })
                    .catch(err => {
                        return reject(err)
                    });

            })
        },
    }
}
module.exports = game;