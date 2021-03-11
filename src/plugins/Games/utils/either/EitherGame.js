const {
    default: axios
} = require("axios")
const cheerio = require('cheerio');
const Utils = require("./../../../../utils/utils")

var game = {
    getQuestion: async (id) => {
        try {
            var r = (await axios.get(`http://either.io/${id}`)).data
        } catch (error) {
            return game.getQuestion(id)
        }
        
        const c = cheerio.load(r)
        var questions = {
            red_choice: {
                question: c("div.red-choice div.option a").html().replace("\n", ""),
                total_votes: parseInt(c("div.red-choice div.total-votes span.count").html().replace(/,/g, "")),
                percentage: 0
            },
            blue_choice: {
                question: c("div.blue-choice div.option a").html().replace("\n", ""),
                total_votes: parseInt(c("div.blue-choice div.total-votes span.count").html().replace(/,/g, "")),
                percentage: 0
            },
            total_votes: 0
        }
        questions.total_votes = questions.blue_choice.total_votes + questions.red_choice.total_votes
        questions.red_choice.percentage = questions.red_choice.total_votes / questions.total_votes
        questions.blue_choice.percentage = questions.blue_choice.total_votes / questions.total_votes

        return questions
    },
    Reactions: {
        async _sendRectsLight(message) {
            await message.react("🟦")
            await message.react("🟥")
            await message.react("❌")
        },
        reactEmbed(message, onReact) {
            return new Promise(async (resolve, reject) => {
                await game.Reactions._sendRectsLight(message)
                const filter = (reaction, user) => {
                    if (["754756207507669128", "753723888671785042", "757333853529702461", message.author.id].includes(user.id)) {
                        return false
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
                    .then(collected => {
                        return resolve()
                    })
                    .catch(err => {
                        return reject(err)
                    });

            })
        },
    }
}
module.exports = game