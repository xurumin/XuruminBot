//const numCpus = require("os").cpus().length
require('dotenv/config');

const {
  ShardingManager
} = require('discord.js');
const shard = new ShardingManager('./src/bot.js', {
  token: process.env.DISCORD_API
});

const BotStatusSocket = require("./libs/BotStatusSocket")

var user_access = {
  user: "test1",
  userAgent: "bot_access_client",
  token: "bdd23d1555a7c0322637c54f1e60a03b9672459dcc3e8882b0a655607eb256a3fa935511bc67c0ac6cf4446c6f52638a91db72698614a57d844f79353eefae37"
}


shard.on('shardCreate', shard => console.log(`Launched shard ${shard.id}`));
shard.spawn(Number(process.env.SHARDS))
  .then(async () => {
    if (process.env.NODE_ENV == "production") {
      const DBL = require("dblapi.js");
      const dbl = new DBL(process.env.TOPGG_API, shard);

      async function postDBL() {
        //client.guilds.cache.size
        dbl.postStats(await getServerCount());
      }
      postDBL()
      setInterval(async () => {
        postDBL()
      }, 1800000);
    }


    console.log(`> RUNING ${process.env.SHARDS} SHARD(s)`)
    console.log(`> ONLINE ON ${await getServerCount()} GUILDS`)

    BotStatusSocket.init(2257, "", user_access)
    BotStatusSocket.setStatus({
      guilds: await getServerCount()
    })
  });

const getServerCount = async () => {
  const req = await shard.fetchClientValues('guilds.cache.size');
  return req.reduce((p, n) => p + n, 0);
}