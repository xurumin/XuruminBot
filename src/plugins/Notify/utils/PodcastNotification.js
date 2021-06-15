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

class PodcastNotify {
    constructor() {
        this.__podcasts = []
        this.EventEmitter = new EventEmitter()
    }
    async __getLastPodcastEp(feedUrl){
        let feedData;
        try {
            feedData = (await parseStringPromise((await axios.get(feedUrl)).data))
        } catch (error) {
            return;
        }
        let parsedFeed = feedData["rss"]["channel"][0]["item"][0]
        return {
            title: parsedFeed["title"][0],
            show: feedData["rss"]["channel"][0]["title"][0],
            author: feedData["rss"]["channel"][0]["itunes:author"][0] || feedData["rss"]["channel"][0]["googleplay:author"][0],
            url: parsedFeed.enclosure[0]["$"]["url"]
        }
    }
    async __getLastEps(feedUrl, lastEpUrl){
        let feedData;
        try {
            feedData = (await parseStringPromise((await axios.get(feedUrl)).data))
        } catch (error) {
            return [];
        }
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
                    url: ep.enclosure[0]["$"]["url"],
                    pic: ep["itunes:image"][0]["$"]["href"] || ""
                }
            })
        }else{
            return []
        }
    }

    async __updatePodcastList(){
        var pods = [];
        const allPods = await Utils.PodcastNotify.getAllPodcasts()
        for (const key in allPods) {
            var lastEpUrl = allPods[key]["lastEpUrl"]
            if(!lastEpUrl){
                lastEpUrl = (await this.__getLastPodcastEp(allPods[key]["feedUrl"]))["url"]
                Utils.PodcastNotify.setLastEp(Utils.PodcastNotify.getPodcastFeedHash(allPods[key]["feedUrl"]), lastEpUrl)
            }
            pods.push({
                feedUrl: allPods[key]["feedUrl"],
                lastEpUrl: lastEpUrl,
                ...allPods[key]
            })
        }
        this.__podcasts = pods
    }

    async addFeedUrl(feedUrl, channelId){
        const podcastFeedUrl = feedUrl

        const podcastFeedHash = Utils.PodcastNotify.getPodcastFeedHash(podcastFeedUrl)

        const doesPodcastExists = await Utils.PodcastNotify.doesPodcastExists(podcastFeedHash)

        if(doesPodcastExists){
            await Utils.PodcastNotify.addChannelToPodcast(podcastFeedHash, channelId)
        }else{
            await Utils.PodcastNotify.setPodcast(podcastFeedHash, podcastFeedUrl)
            await Utils.PodcastNotify.addChannelToPodcast(podcastFeedHash, channelId)

            await Utils.PodcastNotify.setLastEp(podcastFeedHash, (await this.__getLastPodcastEp(podcastFeedUrl))["url"])
        }
    }

    async __verify(){
        for(var podcast of this.__podcasts){
            let lastEp = await this.__getLastPodcastEp(podcast["feedUrl"])
            var lastEps = await this.__getLastEps(podcast["feedUrl"], podcast["lastEpUrl"])

            if(lastEps.length > 0){
                const podcastFeedHash = Utils.PodcastNotify.getPodcastFeedHash(podcast["feedUrl"])
                await Utils.PodcastNotify.setLastEp(podcastFeedHash, lastEp["url"])
                this.EventEmitter.emit("newEps", {
                    channels: Object.keys(podcast["channels"]),
                    feedUrl: podcast["feedUrl"],
                    eps:lastEps
                })
            }
        }
    }
    async run(interval) {
        await this.__updatePodcastList()
        await this.__verify()
        setInterval(async () => {
            console.log("verifying");
            await this.__updatePodcastList()
            await this.__verify()
        }, interval)
    }
}

module.exports = new PodcastNotify()