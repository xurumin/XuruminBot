//const numCpus = require("os").cpus().length
require('dotenv/config');

const { ShardingManager } = require('discord.js');
const shard = new ShardingManager('./src/bot.js', {
  token: process.env.DISCORD_API
});



shard.on('shardCreate', shard => console.log(`Launched shard ${shard.id}`));
shard.spawn(Number(process.env.SHARDS))
.then(async ()=>{
  if(process.env.NODE_ENV == "production"){
    const DBL = require("dblapi.js");
    const dbl = new DBL(process.env.TOPGG_API, shard);
    
    async function postDBL(){
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
});

const getServerCount = async () => {
  const req = await shard.fetchClientValues('guilds.cache.size');
  return req.reduce((p, n) => p + n, 0);
}