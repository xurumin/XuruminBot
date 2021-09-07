"use strict"
const discord = require("discord.js");
const crypto = require("crypto");
const ms = require("ms")
require('dotenv/config');

String.prototype.interpolate = function (params) {
  "use strict"
  return stringTemplateParser(this, params)
}


function stringTemplateParser(expression, valueObj) {
  const templateMatcher = /{{\s?([^{}\s]*)\s?}}/g;
  let text = expression.replace(templateMatcher, (substring, value, index) => {
    value = valueObj[value];
    return value;
  });
  return text
}

var admin = require("firebase-admin");
const {
  default: axios
} = require("axios");

var serviceAccount = JSON.parse(process.env.GOOGLE_FIREBASE_CREDENTIALS);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://kkkklink.firebaseio.com"
});
var db = admin.database()
var profilesRef = db.ref("profiles");
var botInfoRef = db.ref("bot");
var gameOffersRef = db.ref("gameOffers");
var banRef = db.ref("ban");
var podcastNotifyRef = db.ref("podcastNotify");

var $;

var exp = {
  angleToRadians(angle) {
    return (-angle * Math.PI) / 180
  },
  shuffle(array) {
    var currentIndex = array.length,
      temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }

    return array;
  },

  createSimpleEmbed(title, text = "", author = "", thumbnail = "") {
    return new discord.MessageEmbed()
      .setColor('#9d65c9')
      .setTitle(title)
      .setAuthor(author)
      .setDescription(text)
      .setThumbnail(thumbnail)
  },
  toHHMMSS(secs) {
    var sec_num = parseInt(secs, 10)
    var hours = Math.floor(sec_num / 3600)
    var minutes = Math.floor(sec_num / 60) % 60
    var seconds = sec_num % 60

    return [hours, minutes, seconds]
      .map(v => v < 10 ? "0" + v : v)
      .filter((v, i) => v !== "00" || i > 0)
      .join(":")
  },
  hmsToSeconds(str) {
    var p = String(str).split(':'),
      s = 0,
      m = 1;

    while (p.length > 0) {
      s += m * parseInt(p.pop(), 10);
      m *= 60;
    }

    return s;
  },
  globalTimeToMS(input) {
    const msT = ms(input)
    const hmsT = this.hmsToSeconds(input) * 1000
    return msT || hmsT || null
  },
  wait(ms) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve();
      }, ms)
    })
  },
  similarity(s1, s2) {
    var longer = s1;
    var shorter = s2;
    if (s1.length < s2.length) {
      longer = s2;
      shorter = s1;
    }
    var longerLength = longer.length;
    if (longerLength == 0) {
      return 1.0;
    }
    return (longerLength - this.__editDistance(longer, shorter)) / parseFloat(longerLength);
  },

  __editDistance(s1, s2) {
    s1 = s1.toLowerCase();
    s2 = s2.toLowerCase();

    var costs = new Array();
    for (var i = 0; i <= s1.length; i++) {
      var lastValue = i;
      for (var j = 0; j <= s2.length; j++) {
        if (i == 0)
          costs[j] = j;
        else {
          if (j > 0) {
            var newValue = costs[j - 1];
            if (s1.charAt(i - 1) != s2.charAt(j - 1))
              newValue = Math.min(Math.min(newValue, lastValue),
                costs[j]) + 1;
            costs[j - 1] = lastValue;
            lastValue = newValue;
          }
        }
      }
      if (i > 0)
        costs[s2.length] = lastValue;
    }
    return costs[s2.length];
  },
  getErrorMessage() {
    return this.createSimpleEmbed("❌ Erro ao executar comando:", `O serviço está temporariamente indisponível 😞\nNossos gatinhos programadores estão fazendo o possível para resolver isso 🤗`)
  },
  random(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },
  randomFloat(min, max) {
    return Math.random() * (max - min) + min;
  },
  choice(array) {
    return array[Math.floor(Math.random() * array.length)]
  },
  stringTemplateParser: stringTemplateParser,
  XP2LV(xp) {
    //var lv = ((10**((Math.log10(xp/0.05) - 3)/1.5))+1)
    //var lv = ((10 ** ((Math.log10(xp) - 2) / 1.5)) + 1)

    var lv = xp / 25

    return parseInt(lv.toFixed(0))
  },
  throttle(func, wait, options) {
    var context, args, result;
    var timeout = null;
    var previous = 0;
    if (!options) options = {};
    var later = function() {
      previous = options.leading === false ? 0 : Date.now();
      timeout = null;
      result = func.apply(context, args);
      if (!timeout) context = args = null;
    };
    return function() {
      var now = Date.now();
      if (!previous && options.leading === false) previous = now;
      var remaining = wait - (now - previous);
      context = this;
      args = arguments;
      if (remaining <= 0 || remaining > wait) {
        if (timeout) {
          clearTimeout(timeout);
          timeout = null;
        }
        previous = now;
        result = func.apply(context, args);
        if (!timeout) context = args = null;
      } else if (!timeout && options.trailing !== false) {
        timeout = setTimeout(later, remaining);
      }
      return result;
    };
  },
  async translate(from, to, message) {
    var url = "https://translate.googleapis.com/translate_a/single?client=gtx&sl=" + from + "&tl=" +
      to + "&dt=t&q=" + message + "&ie=UTF-8&oe=UTF-8"
    try {
      var translation = (await axios.get(url)).data
      return translation[0][0][0]
    } catch (error) {
      //console.log(error);
      return message;
      return this.translate(from, to, message)
    }
  },
  GameOffers: {
    async setChannel(channelId) {
      var child = await gameOffersRef.child("channels")
      return await child.child(channelId).set("")
    },
    async removeChannel(channelId) {
      var child = await gameOffersRef.child("channels")
      return await child.child(channelId).remove()
    },
    async getAllListeners() {
      var child = await gameOffersRef.child("channels")
      return await (await child.once("value")).val()
    },
    async setLastGame(gameHash) {
      var child = await gameOffersRef.child("lastGame")
      return await child.child("hash").set(gameHash)
    },
    async getLastGame() {
      var child = await gameOffersRef.child("lastGame")
      return await (await child.get("hash")).val().hash
    }
  },
  PodcastNotify: {
    async addChannelToPodcast(podcastFeedHash, channelId) {
      var child = await podcastNotifyRef.child("podcasts")
      return await child.child(podcastFeedHash).child("channels").child(channelId).set(new Date().getTime())
    },
    async removeChannel(channelId) {
      var child = await podcastNotifyRef.child("podcasts")

      child.orderByChild('name').equalTo('John Doe').on("value", function (snapshot) {
        console.log(snapshot.val());
        snapshot.forEach(function (data) {
          console.log(data.key);
        });
      });
      return await child.child(podcastFeedHash).child("channels").child(channelId).remove()
    },
    async setPodcast(podcastFeedHash, feedUrl) {
      var child = await podcastNotifyRef.child("podcasts")
      return await child.child(podcastFeedHash).child("feedUrl").set(feedUrl)
    },
    async setLastEp(podcastFeedHash, lastEpUrl) {
      var child = await podcastNotifyRef.child("podcasts")
      return await child.child(podcastFeedHash).child("lastEpUrl").set(lastEpUrl)
    },
    async doesPodcastExists(podcastFeedHash) {
      var child = await podcastNotifyRef.child("podcasts")
      return (await child.child(podcastFeedHash).get()).exists()
    },
    async getAllPodcasts() {
      var child = await podcastNotifyRef.child("podcasts")
      return await (await child.once("value")).val()
    },
    getPodcastFeedHash(feedUrl) {
      return crypto.createHash("sha256").update(feedUrl).digest("hex")
    }
  },

  Updaters: {
    getPremiumUsers: () => {
      return new Promise(async (resolve, reject) => {
        const premiumUsers = this
      })
    }
  },
  BotDB: {
    async setBotInfo(cmdSent) {
      await botInfoRef.set({
        "commandsSent": cmdSent
      })
    },
    async getSentCmds() {
      var sentCmds = (await botInfoRef.get("commandsSent")).val().commandsSent
      return sentCmds ? sentCmds : 0
    }
  },
  Ban: {
    async setBan(userid) {
      await banRef.child(userid).set(Date.now())
    },
    async removeBan(userid) {
      await banRef.child(userid).remove()
    },
    async isBanned(userid) {
      return (await banRef.child(userid).get()).exists()
    },
    async getBanList() {
      return (await banRef.get()).val()
    }
  },
  Profile: {
    setProfile: async (client, user_id_raw, bg_url, aboutme, level, points, money = 0, badges = []) => {
      const user_id = crypto.createHash("sha256").update(user_id_raw).digest("hex");
      var usersRef = profilesRef.child("users")
      await usersRef.child(user_id).set({
        aboutme: aboutme,
        bg_url: bg_url,
        level: level,
        points: points,
        badges: badges,
        userId: user_id_raw,
        money: money
      });
    },
    setTag: async (client, user_id_raw, tag, value) => {
      const user_id = crypto.createHash("sha256").update(user_id_raw).digest("hex");
      var usersRef = profilesRef.child("users")
      var updateObj = {}
      updateObj[tag] = value
      await usersRef.child(user_id).update(updateObj)

      //client.profiles.get(user_id)[tag] = value
    },
    getProfile: async (client, user_id_raw) => {
      const user_id = crypto.createHash("sha256").update(user_id_raw).digest("hex");
      var usersRef = profilesRef.child("users")
      var user_profile = (await usersRef.get(user_id)).val()[user_id]
      const profile_pattern = {
        aboutme: user_profile.aboutme || "",
        bg_url: user_profile.bg_url,
        level: user_profile.level || 0,
        points: user_profile.points || 0,
        badges: user_profile.badges || [],
        userId: user_id_raw,
        money: user_profile.money || 0,
        ...user_profile
      }
      return profile_pattern
      //return client.profiles.get(user_id)
    },
    hasProfile: async (client, user_id_raw) => {
      const user_id = crypto.createHash("sha256").update(user_id_raw).digest("hex");
      var usersRef = profilesRef.child("users")
      return (await usersRef.child(user_id).once("value")).exists()


      //return client.profiles.has(user_id)
    },
    isPremium: async (client, user_id_raw) => {
      var profile = await exp.Profile.getProfile(client, user_id_raw)

      if (profile && profile["status"]) {
        return (profile["status"]) == "premium";
      }
      return false;

    },
    getStandardProfile: () => {
      return {
        bg_url: "https://i.imgur.com/MbGPZQR.png",
        level: 0,
        points: 0,
        money: 0,
        aboutme: "",
        badges: []
      }
    },
    getBadges: async () => {
      var badgesRef = profilesRef.child("badges")
      return (await badgesRef.get()).val()
    }
  },
  Reactions: {
    async _sendRectsLight(message) {
      await message.react("✅")
      await message.react("❌")
    },
    getConfirmation(message, userId, time = 100000) {
      return new Promise(async (resolve, reject) => {
        await exp.Reactions._sendRectsLight(message)
        const filter = (reaction, user) => {
          if (["754756207507669128", "753723888671785042", "757333853529702461", message.author.id].includes(user.id) || user.id != userId) return false;
          return true;
        };
        message.awaitReactions({
            filter,
            max: 1,
            time: time,
            errors: ['time']
          })
          .then(collected => {
            const reaction = collected.first();
            switch (reaction.emoji.name) {
              case "✅":
                resolve(true)
                break;
              case "❌":
                resolve(false)
                break;
              default:
                resolve(false)
                break;
            }
          })
          .catch(collected => {
            reject(collected)
          });

      })
    }
  },
  KarinnaAPI: {
    get(path, params, timeout = 120000) {
      return new Promise(async (resolve, reject) => {
        axios.get(`${process.env.KARINNA_API_PATH}${path}`, {
          headers: {
            authorization: process.env.KARINNA_API_TOKEN
          },
          params: params,
          timeout: timeout,
          responseType: "arraybuffer"
        }).then(async (res) => {
          return resolve(res.data)
        }).catch(async (err) => {
          return reject(err)
        })
      })
    }
  }
}
module.exports = exp