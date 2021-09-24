const Utils = require("./../../../utils/utils");
const MusicPlayer = require("./../utils/MusicPlayer");
require('dotenv/config');
var url = require('url');

const twitch = require("twitch-m3u8");

/**
 * playlist format
 * {
    name:
    url:
    author:
    duration:
    }
*/
async function playTwitch(client, message, track_url, LOCALE) {
    var player = await new MusicPlayer(message.guild.id, client, message, "mp3");
    await player.__connectVoice();
    client.players.set(message.guild.id, player);
    player.setPlaylist([{
        name: "TWITCH",
        url: track_url,
        author: "TWITCH",
        duration: Infinity
    }]);
    player.playMp3();
    return message.send_(Utils.createSimpleEmbed(LOCALE.title, LOCALE["stream_added"]));
}

module.exports = {
    /**
     * @param  {Discord.Client} client
     * @param  {Discord.Message} message
     * @param  {} args
     */
    run: async (client, message, args, LOCALE) => {
        const url_ = url.parse(args.join(""));

        if (!url_.host) {
            var twitch_user = args.join("");

        } else {
            if (!args.join("") || (url_.host != "twitch.tv" && url_.host != "www.twitch.tv")) {
                return message.send_(Utils.createSimpleEmbed(LOCALE["errors"]["not_found"]));
            }
            // var twitch_user = url_.path.split("/")[1]
        }
        twitch.getStream(twitch_user)
            .then(async data => {

                var player = client.players.get(message.guild.id);
                if (!player) {
                    var audio = data.find(elm => elm.quality = "audio_only")["url"];
                    return playTwitch(client, message, audio, LOCALE);
                }

                var msg = await message.send_(Utils.createSimpleEmbed(LOCALE["already_playing"]["title"], LOCALE["already_playing"].description));
                Utils.Reactions.getConfirmation(
                        msg, message.author.id
                    ).then(async (value) => {
                        await msg.delete();
                        if (!value) {
                            return await message.send_(Utils.createSimpleEmbed(LOCALE["decline"], ""));
                        }
                        var audio = data.find(elm => elm.quality = "audio_only")["url"];
                        return playTwitch(client, message, audio, LOCALE);
                    })
                    .catch(async () => {
                        return message.send_(Utils.createSimpleEmbed(LOCALE["decline"], ""));
                    });
            })
            .catch(() => {
                return message.send_(Utils.createSimpleEmbed(LOCALE["errors"]["not_found"]));
            });

    },
    get command() {
        return {
            name: 'twitch'
        };
    },
};