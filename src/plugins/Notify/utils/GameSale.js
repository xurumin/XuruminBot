var EventEmitter = require("events").EventEmitter
const {
    default: axios
} = require("axios");
const cheerio = require('cheerio');
const fs = require("fs")
const url = require("url")

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
            url: "https://isthereanydeal.com/?by=time:desc",
            lastSales: []
        }
        this.EventEmitter = new EventEmitter()
    }
    async init() {
        //this.__proxy = await getRandomProxy()
        this.__proxy = ["23.21.12.2", 80]
    }
    async testIp() {
        return await this.get("http://httpbin.org/ip")
    }
    async updateProxy() {
        //console.log("[LOG] updating proxy");
        //this.__proxy = await getRandomProxy()
    }
    async get(url) {
        try {
            var res = await axios.get(url, {
                // proxy: {
                //     host: this.__proxy[0],
                //     port: this.__proxy[1]
                // },
                 headers:{
                     "Cookie": "region=br2; country=BR%3ABrazil;"
                 },
                timeout: 20000
            })
            // var res = await axios.get(url, {
            //     timeout: 5000,
            //     headers:{
            //         "Cookie": "region=br2; country=BR%3ABrazil;"
            //     }
            // })
        } catch (error) {
            return false;
        }
        return res.data
    }
    async addUser(userid) {
        this.__NotifyUsers.push(userid)
    }
    async __getLastGames(last=15){
        var site = await this.get(this.__gameSale.url)
        
        if(site == false){
            return []
        }

        var c = cheerio.load(site)
        var games = c("div#games div.game")

        var g = []

        for(var game of games.slice(0,last)){
            var game_info = c(game)
            var price_list = game_info.find("div.deals a").toArray().map((game_sale)=> {
                return {
                    price: c(game_sale).text().replace(/n:/g, ""),
                    href: c(game_sale).attr("href"),
                    review: game_info.find("div.overview.def.tgl-hide").text()
                }
            })
            g.push({
                name: game_info.find("div.title a.noticeable").text(),
                price: price_list
            })
        }
        return g;
    }
    filterSite(site_info){
        const siteList = [
            ["store.steampowered.com", "Steam"],
            ["microsoft.com", "Microsoft"],
            ["epicgames.com", "Epic Games"],
            ["origin.com", "Origin"],
            ["gog.com", "GOG"],
            ["nuuvem.com", "Nuuvem"]
        ]
        var sites = []
        for(var price of site_info.price){
            var siteUrl = url.parse(price.href).hostname
            if(!siteUrl) continue;
            if(siteUrl){
                siteUrl = siteUrl.replace("www.", "")
            }
            var sitePrice = price.price
            var index = siteList.findIndex((elm)=> siteUrl.endsWith(elm[0]))

            if(index == -1){
                continue;
            }
            sites.push({
                url: price.href,
                price: sitePrice,
                siteName: siteList[index][1]
            })
        }
        return {
            game_name: site_info.name,
            prices: sites
        };
    }
    async __verify(last=15){
        //console.log("[GAMESALE LOG] Runing check");
        const newSales = await this.__getLastGames(20)


        if(newSales[0] && this.__gameSale.lastSales.length > 0 && newSales[0].name == this.__gameSale.lastSales[0].name){
            //console.log("no new games");
            return;
        }

        var index = this.__gameSale.lastSales.findIndex((elm)=>elm.href==newSales[0].href)
        var newGamesList = []
        for(var game of newSales.slice(0,index+1)){
            var filteredGame = this.filterSite(game)
            if(filteredGame.prices.length > 0){
                newGamesList.push(filteredGame)
            }
        }
        if(newGamesList.length>0){
            this.EventEmitter.emit("newGames", newGamesList)
        }
        this.__gameSale.lastSales = newSales
    }
    async run(interval) {
        await this.__verify()
        setInterval(async () => {
            await this.__verify()
        }, interval)
    }
}

module.exports = GameSale