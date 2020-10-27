const database = require("./../utils/database")
const random_meme = require("./../utils/meme")
const Discord = require('discord.js');



var client_ = Discord.Client;
module.exports = {
    /**
     * @param  {Discord.Client} client
     */
    init(client){
        client_ = client
        console.log(`[runner_meme] Loaded`)
    },
    run(){
        setInterval(async ()=>{
            console.log(`[runner_meme] "Sending memes..."`)

            const servers = await database.getAll()

            servers.forEach(el => {

                const channel = client_.channels.cache.get(el.channel_id)
                random_meme.getRandomMeme()
                .then(data=>{
                    const meme_embed = new Discord.MessageEmbed()
                    .setTitle('Hm, que tal um meme?')
                    .setDescription(data.text)
                    .setColor('#8146DC')
                    .setImage(data.url)
                    .setFooter(
                        `${(data.source).toLocaleUpperCase()} - ${data.author.screen_name}`,
                        'https://i.imgur.com/PAYbEgv.png'
                    )
                    .setTimestamp();
                    
                    return channel.send(meme_embed);
                })
                .catch(error=>{
                    console.log(error)
                    return channel.send("Alguma coisa deu errado...");
                })
            });
        }, 60 * 60 * 1000)
    }
}