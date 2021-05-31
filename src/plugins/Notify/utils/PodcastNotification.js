var EventEmitter = require("events").EventEmitter
const Utils = require("./../../../utils/utils")
const {
    default: axios
} = require("axios");
const cheerio = require('cheerio');
const fs = require("fs")
const url = require("url")
const crypto = require("crypto")
var parseStringPromise = require('xml2js').parseStringPromise;

class GameSale {
    constructor() {
        this.__podcasts = []
        this.EventEmitter = new EventEmitter()
    }
    async __getLastPodcastEp(feedUrl){
        const feedData = (await parseStringPromise((await axios.get(feedUrl)).data))
        let parsedFeed = feedData["rss"]["channel"][0]["item"][0]
        return {
            title: parsedFeed["title"][0],
            show: feedData["rss"]["channel"][0]["title"][0],
            author: feedData["rss"]["channel"][0]["itunes:author"][0] || feedData["rss"]["channel"][0]["googleplay:author"][0],
            url: parsedFeed.enclosure[0]["$"]["url"]
        }
    }
    async __getLastEps(feedUrl, lastEpUrl){
        const feedData = (await parseStringPromise((await axios.get(feedUrl)).data))
        let parsedFeed = feedData["rss"]["channel"][0]["item"].slice(0,10)

        let lastEp = parsedFeed.find(ep=> {
            return ep.enclosure[0]["$"]["url"]==lastEpUrl
        })

        let allLastEpsIndex = parsedFeed.indexOf(lastEp)
        let allLastEps = parsedFeed.slice(0, allLastEpsIndex)
        if(allLastEps && allLastEps.length > 0){
            return allLastEps.map((ep)=>{
                return {
                    title: ep["title"][0],
                    show: feedData["rss"]["channel"][0]["title"][0],
                    author: feedData["rss"]["channel"][0]["itunes:author"][0] || feedData["rss"]["channel"][0]["googleplay:author"][0],
                    url: ep.enclosure[0]["$"]["url"]
                }
            })
        }else{
            return []
        }
    }

    async __updatePodcastList(){
        const podcastFeedUrl = "https://jovemnerd.com.br/feed-nerdcast/"

        const podcastFeedHash = Utils.PodcastNotify.getPodcastFeedHash(podcastFeedUrl)

        const doesPodcastExists = await Utils.PodcastNotify.doesPodcastExists(podcastFeedHash)

        if(doesPodcastExists){
            console.log("podcast existe");
            await Utils.PodcastNotify.addChannelToPodcast(podcastFeedHash, "820733324367626260")
        }else{
            console.log("novo podcast");
            await Utils.PodcastNotify.setPodcast(podcastFeedHash, "https://jovemnerd.com.br/feed-nerdcast/")
            await Utils.PodcastNotify.addChannelToPodcast(podcastFeedHash, "820733324367626260")
        }
        
    }

    async __verify(){
        for(var podcast of this.__podcasts){
            let lastEp = this.__getLastPodcastEp(podcast["feedUrl"])
            var lastEps = await this.__getLastEps(lastEp["url"])
            if(lastEps.length > 0){
                return this.EventEmitter.emit("newEps", lastEps)
            }
        }
    }
    async run(interval) {
        this.__updatePodcastList()
        await this.__verify()
        setInterval(async () => {
            await this.__verify()
        }, interval)
    }
}

module.exports = new GameSale()