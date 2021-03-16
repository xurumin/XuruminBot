var EventEmitter = require("events").EventEmitter
const Utils = require("./../../../utils/utils")
const {
    default: axios
} = require("axios");
const cheerio = require('cheerio');
const fs = require("fs")
const url = require("url")
const crypto = require("crypto")


function getRandomProxy() {
    return new Promise((resolve, reject) => {
        axios.get("https://api.getproxylist.com/proxy?protocol=http&maxSecondsToFirstByte=2000")
            .then(res => {
                resolve([res.data.ip, res.data.port])
            }).catch(reject)
    });
}



class GameSale {
    constructor() {
        this.__NotifyUsers = []
        this.__gameSale = {
            url: "https://yesthereisadeal.com/",
            lastSales: []
        }
        this.EventEmitter = new EventEmitter()
    }
    async init() {
        //this.__proxy = await getRandomProxy()
        this.__proxy = ["23.21.12.2", 80]
    }
    async updateProxy() {
        //console.log("[LOG] updating proxy");
        //this.__proxy = await getRandomProxy()
    }
    async addUser(userid) {
        this.__NotifyUsers.push(userid)
    }
    async __getGame(){
        var site = (await axios.get(this.__gameSale.url)).data
        
        if(site == false){
            return []
        }


        var c = cheerio.load(site)
        var game = c("section#deal")

        var script = site.split("<script type='text/javascript'>")
        var temp = String(script[1].split("</script>")[0])
        var json = '';
        if(temp.indexOf("var currentDeal")!== -1){              
            json = temp.substring(temp.indexOf("{"), temp.indexOf("};")+1);            
            json = JSON.parse(json);
        }
        if(json == ''){
            return false
        }
        // return {
        //     nextDeal: game.find("div#countdown").text(),
        //     title: game.find("a.deal-link h1").text(),
        //     price: game.find("span.price_info span.price").text(),
        //     price_cut: game.find("span.price_info span.price_cut").text(),
        //     store: {
        //         name: game.find("span.shop_info span.shop").text(),
        //         href: game.find("a.deal-link").attr("href")
        //     }
        // }
        return {
            title: json.deal.title,
            price: json.deal.deal.price,
            price_cut: json.deal.deal.cut,
            store: {
                name: json.deal.shop.title,
                href: json.deal.url
            }
        }
    }
    async __verify(){
        //console.log("[GAMESALE LOG] Runing check");
        const newGame = await this.__getGame()
        const newGameHash = crypto.createHash("sha256").update(JSON.stringify(newGame)).digest("hex")
        const lastGameHash = await Utils.GameOffers.getLastGame()

        if(newGameHash != lastGameHash){
            Utils.GameOffers.setLastGame(newGameHash)
            return this.EventEmitter.emit("newGames", newGame)
        }
        return;
    }
    async run(interval) {
        await this.__verify()
        setInterval(async () => {
            await this.__verify()
        }, interval)
    }
}

module.exports = GameSale