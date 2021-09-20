var EventEmitter = require("events").EventEmitter
const Utils = require("./../../../utils/utils")
const {
    default: axios
} = require("axios");
var parseStringPromise = require('xml2js').parseStringPromise;

const podcastDatabase = require("./../../../database/PodcastDB")
const podcastDB = new podcastDatabase();

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

    async getPodcastInfo(feedUrl){
        let feedData;
        try {
            feedData = (await parseStringPromise((await axios.get(feedUrl)).data))
        } catch (error) {
            return {};
        }
        return {
            title: feedData["rss"]["channel"][0]["title"][0]
        }

    }

    async __updatePodcastList(){
        var pods = [];
        const allPods = await podcastDB.getAllPodcasts()

        for (const podcast of allPods) {
            var lastEpUrl = podcast.lastEpUrl
            if(!lastEpUrl){
                lastEpUrl = (await this.__getLastPodcastEp(podcast["feedUrl"]))["url"]
                await podcastDB.setLastEp(podcastDB.getPodcastFeedHash(podcast["feedUrl"]), lastEpUrl)
            }
            pods.push({
                feedUrl: podcast["feedUrl"],
                lastEpUrl: lastEpUrl,
                ...podcast
            })
        }
        this.__podcasts = pods
    }

    async addFeedUrl(feedUrl, channelId){
        const podcastFeedUrl = feedUrl

        const podcastFeedHash = podcastDB.getPodcastFeedHash(podcastFeedUrl)

        const doesPodcastExists = await podcastDB.doesPodcastExists(podcastFeedHash)

        if(doesPodcastExists){
            await podcastDB.addChannelToPodcast(podcastFeedHash, channelId)
        }else{
            await podcastDB.setPodcast(podcastFeedHash, podcastFeedUrl)
            await podcastDB.addChannelToPodcast(podcastFeedHash, channelId)

            await podcastDB.setLastEp(podcastFeedHash, (await this.__getLastPodcastEp(podcastFeedUrl))["url"])
        }
    }

    async __verify(){
        for(var podcast of this.__podcasts){
            let lastEp = await this.__getLastPodcastEp(podcast["feedUrl"])
            var lastEps = await this.__getLastEps(podcast["feedUrl"], podcast["lastEpUrl"])

            if(lastEps.length > 0){
                const podcastFeedHash = podcastDB.getPodcastFeedHash(podcast["feedUrl"])
                await podcastDB.setLastEp(podcastFeedHash, lastEp["url"])
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