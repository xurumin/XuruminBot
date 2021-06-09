//const numCpus = require("os").cpus().length
require('dotenv/config');

const {
  default: axios
} = require('axios');
const {
  ShardingManager
} = require('discord.js');
const shard = new ShardingManager('./src/bot.js', {
  token: process.env.DISCORD_API
});

var DISCORD_BOTS_GG_API = process.env.DISCORD_BOTS_GG_API
const BotStatusSocket = require("./libs/BotStatusSocket")

shard.on('shardCreate', shard => console.log(`Launched shard ${shard.id}`));
shard.spawn(Number(process.env.SHARDS))
  .then(async () => {
    const Topgg = require('@top-gg/sdk')
    const api = new Topgg.Api(process.env.TOPGG_API)

    if (process.env.NODE_ENV == "production") {
      async function postDBL() {
        try {
          await axios.post("https://discord.bots.gg/api/v1/bots/753723888671785042/stats", {
            guildCount: await getServerCount()
          }, {
            headers: {
              Authorization: DISCORD_BOTS_GG_API
            }
          })
          api.postStats({
            serverCount: await getServerCount()
          })
        } catch (error) {
          console.log(error);
        }
      }
      postDBL()
      setInterval(async () => {
        postDBL()
      }, 1800000);
    }
    console.log(`> RUNING ${process.env.SHARDS} SHARD(s)`)
    console.log(`> ONLINE ON ${await getServerCount()} GUILDS`)

  });

const getVoiceConnectionsCount = async () => {
  const req = await shard.fetchClientValues('voice.connections.size');
  return req.reduce((p, n) => p + n, 0);
}

const getServerCount = async () => {
  const req = await shard.fetchClientValues('guilds.cache.size');
  return req.reduce((p, n) => p + n, 0);
}