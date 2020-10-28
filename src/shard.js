//const numCpus = require("os").cpus().length
require('dotenv/config');

const { ShardingManager } = require('discord.js');
const shard = new ShardingManager('./src/bot.js', {
  token: process.env.DISCORD_API
});
console.log(`RUNING ${process.env.SHARDS} SHARDS`)
shard.on('shardCreate', shard => console.log(`Launched shard ${shard.id}`));
shard.spawn(process.env.SHARDS);