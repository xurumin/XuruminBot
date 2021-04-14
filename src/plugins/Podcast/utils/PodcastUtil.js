const Discord = require('discord.js');
const ytdl = require("ytdl-core")
const axios = require("axios").default;
const Utils = require("./../../../utils/utils")
var parseString = require('xml2js').parseString;

require('dotenv/config');

async function sendRects(message) {
    await message.react("1️⃣")
    await message.react("2️⃣")
    await message.react("3️⃣")
    await message.react("4️⃣")
    await message.react("5️⃣")
    await message.react("⏪")
    await message.react("⏩")
}
async function sendRectsLight(message) {
    await message.react("1️⃣")
    await message.react("2️⃣")
    await message.react("3️⃣")
    await message.react("4️⃣")
    await message.react("5️⃣")
}
module.exports = {
    getPodcastsByTerm(term, cb) {
        return new Promise((resolve, reject) => {
            var url = "https://itunes.apple.com/search?entity=podcast&limit=5&term=" + String(term)
            axios.get(url)
                .then(res => {
                    resolve(res.data["results"].slice(0, 5))
                })
                .catch(err => {
                    reject(err)
                });
        })

    },
    getLastEpsByUrl(url, index = 0) {
        return new Promise((resolve, reject) => {
            axios.get(url)
                .then(xml => {
                    parseString(xml.data, function (err, res) {
                        if (err) {
                            return reject(err)
                        }
                        resolve(res["rss"]["channel"][0]["item"].slice(index, index + 5))
                    })

                }).catch(err => {
                    reject(err)
                });
        })
    },
    getReactLight(message) {
        return new Promise(async (resolve, reject) => {
            sendRectsLight(message)
            const filter = (reaction, user) => {
                return !["754756207507669128", "753723888671785042", "757333853529702461"].includes(user.id);
            };
            message.awaitReactions(filter, {
                    max: 1,
                    time: 100000,
                    errors: ['time']
                })
                .then(collected => {
                    const reaction = collected.first();
                    var index = 0
                    switch (reaction.emoji.name) {
                        case "1️⃣":
                            index = 0
                            break;
                        case "2️⃣":
                            index = 1
                            break;
                        case "3️⃣":
                            index = 2
                            break;
                        case "4️⃣":
                            index = 3
                            break;
                        case "5️⃣":
                            index = 4
                            break;
                        default:
                            reject({
                                status: 3,
                                data: "usuário não selecionou nenhum dos emojis",
                                message: message
                            })
                            break;
                    }
                    resolve(index)
                })
                .catch(collected => {
                    reject({
                        status: 0,
                        data: collected
                    })
                });

        })
    },
    getReact(message) {
        return new Promise(async (resolve, reject) => {
            sendRects(message)
            const filter = (reaction, user) => {
                return !["754756207507669128", "753723888671785042", "757333853529702461", "760496747625185330"].includes(user.id);
            };
            message.awaitReactions(filter, {
                    max: 1,
                    time: 100000,
                    errors: ['time']
                })
                .then(collected => {
                    const reaction = collected.first();
                    var index = 0
                    switch (reaction.emoji.name) {
                        case "1️⃣":
                            index = 0
                            break;
                        case "2️⃣":
                            index = 1
                            break;
                        case "3️⃣":
                            index = 2
                            break;
                        case "4️⃣":
                            index = 3
                            break;
                        case "5️⃣":
                            index = 4
                            break;
                        case "⏪":
                            index = 5
                            break;
                        case "⏩":
                            index = 6
                            break;
                        default:
                            reject({
                                status: 3,
                                data: "usuário não selecionou nenhum dos emojis",
                                message: message
                            })
                            break;
                    }
                    resolve(index)
                })
                .catch(collected => {
                    reject({
                        status: 0,
                        data: collected
                    })
                });

        })
    }
}