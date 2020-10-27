var Twitter = require('twitter');
var utils = require("./../../utils/utils")

 
var client = new Twitter({
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  access_token_key: process.env.ACCESS_TOKEN_KEY,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET
});

const twitter_meme_list = [
    "CorrupcaoMemes",
    "mineposting1999",
    "amongooc",
    "taliokkjk",
    "foibemespecific",
    "Anuncioestranho",
    "SoutAmericMemes",
    "aliensben10puto",
    "kkkkpaint",
    "DesenhosPutos"
]

function getTwitterRandomMeme(){
    return new Promise(async (resolve, reject)=>{
        var params = {
            screen_name:  twitter_meme_list[Math.floor(Math.random() * twitter_meme_list.length)],
            count: 50,
            include_rts: false,
            exclude_replies: true
        };
        client.get('statuses/user_timeline', params, async function(error, tweets, response) {
            if (error) {
                reject(error)
            }
            tweets = utils.shuffle(tweets)
            
            const tweet = tweets.find(tweet=>tweet["entities"]["media"] && (!tweet["entities"]["media"][0]["expanded_url"].includes("/video/") ))
            if(!tweet){
                console.log("new meme")
                try {
                   var res = await getTwitterRandomMeme()
                    resolve(res)
                } catch (error) {
                    reject(error)
                }
                return;
            }
            const postinfo = {
                author: {
                    name: tweet["user"]["name"],
                    screen_name: tweet["user"]["screen_name"]
                },
                source: "twitter",
                text: tweet["text"],
                url: tweet["entities"]["media"][0]["media_url"]
            }
            resolve(postinfo)
        })
    })
}


function getRandomMeme(){
    return new Promise(async (resolve, reject)=>{
        try {
            var meme = await getTwitterRandomMeme()
            resolve(meme)
        } catch (error) {
            reject(error)
        }
        
    })
}

module.exports = {
    getRandomMeme: getRandomMeme
}