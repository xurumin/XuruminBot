var admin = require("firebase-admin");
const crypto = require("crypto");

const serviceAccount = JSON.parse(process.env.GOOGLE_FIREBASE_CREDENTIALS);

module.exports = class {
    constructor() {
        if (!admin.apps.length) {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
                databaseURL: process.env.FIREBASE_DATABASE_URL
            });
        }
        this.db = admin.firestore()
        this.podcastRef = this.db.collection("podcast_notify")
    }
    async addChannelToPodcast(podcastFeedHash, channelId) {
        return await this.podcastRef.doc(`${podcastFeedHash}`).update({
            channels: admin.firestore.FieldValue.arrayUnion(channelId)
        })
    }
    async removeChannel(podcastFeedHash, channelId) {
        return await this.podcastRef.doc(`${podcastFeedHash}`).update({
            channels: admin.firestore.FieldValue.arrayRemove(channelId)
        })
    }
    async setPodcast(podcastFeedHash, feedUrl) {
        await this.podcastRef.doc(podcastFeedHash).set({
            feedUrl: feedUrl,
            podcastFeedHash: podcastFeedHash,
            channels: []
        }, {merge: true})
    }
    async setLastEp(podcastFeedHash, lastEpUrl) {
        await this.podcastRef.doc(podcastFeedHash).update({
            lastEpUrl: lastEpUrl
        })
    }
    async doesPodcastExists(podcastFeedHash) {
        return (await this.podcastRef.doc(podcastFeedHash).get()).exists
    }
    async getAllPodcasts() {
        return (await this.podcastRef.get()).docs.map(elm=>elm.data())
    }
    async getAllPodcastsByChannel(channelId) {
        return (await this.podcastRef.where('channels', "array-contains", channelId).get()).docs.map(elm=>elm.data())
    }
    getPodcastFeedHash(feedUrl) {
        return crypto.createHash("sha256").update(feedUrl).digest("hex")
    }
}