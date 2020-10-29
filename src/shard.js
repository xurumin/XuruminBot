//const numCpus = require("os").cpus().length
require('dotenv/config');

const { ShardingManager } = require('discord.js');
const shard = new ShardingManager('./src/bot.js', {
  token: process.env.DISCORD_API
});



shard.on('shardCreate', shard => console.log(`Launched shard ${shard.id}`));
shard.spawn(Number(process.env.SHARDS))
.then(async ()=>{
  console.log(`> RUNING ${process.env.SHARDS} SHARD(s)`)
  shard.fetchClientValues('guilds.cache.size')
  .then((res)=>{
    console.log(`> ONLINE ON ${res} GUILDS`)
  })
});