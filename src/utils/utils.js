"use strict"
const discord = require("discord.js")
const crypto = require("crypto")

String.prototype.interpolate = function(params) {
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

var serviceAccount = JSON.parse(process.env.GOOGLE_FIREBASE_CREDENTIALS);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://kkkklink.firebaseio.com"
});
var db = admin.database()
var profilesRef = db.ref("profiles");

module.exports = {
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
  getErrorMessage(){
    return this.createSimpleEmbed("❌ Erro ao executar comando:", `O serviço está temporariamente indisponível 😞\nNossos gatinhos programadores estão fazendo o possível para resolver isso 🤗`, client.user.username, client.user.avatarURL())
  },
  random(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },
  choice(array){
    return array[Math.floor(Math.random() * array.length)]
  },
  stringTemplateParser: stringTemplateParser,
  Profile: {
    setProfile: async (client, user_id_raw, bg_url, aboutme, level, points, badges=[])=>{
      const user_id = crypto.createHash("sha256").update(user_id_raw).digest("hex");
      var usersRef = profilesRef.child("users")
      await usersRef.child(user_id).set({
          aboutme: aboutme,
          bg_url: bg_url,
          level: level,
          points: points,
          badges: badges,
          userId: user_id_raw
      });
      // client.profiles.set(user_id, {
      //   aboutme: aboutme,
			// 	bg_url: bg_url,
			// 	level: level,
			// 	points: points
			// })
    },
    setTag: async (client, user_id_raw, tag, value)=>{
      const user_id = crypto.createHash("sha256").update(user_id_raw).digest("hex");
      var usersRef = profilesRef.child("users")
      var updateObj = {}
      updateObj[tag] = value
      await usersRef.child(user_id).update(updateObj)
      //client.profiles.get(user_id)[tag] = value
    },
    getProfile: async (client, user_id_raw)=>{
      const user_id = crypto.createHash("sha256").update(user_id_raw).digest("hex");
      var usersRef = profilesRef.child("users")
      return (await usersRef.get(user_id)).val()[user_id]
      //return client.profiles.get(user_id)
    },
    hasProfile: async (client, user_id_raw)=>{
      const user_id = crypto.createHash("sha256").update(user_id_raw).digest("hex");
      var usersRef = profilesRef.child("users")
      return (await usersRef.child(user_id).once("value")).exists()
      //return client.profiles.has(user_id)
    },
    getStandardProfile: ()=>{
      return {
        bg_url: "https://i.imgur.com/MbGPZQR.png",
        level: 0,
				points: 0,
        aboutme: "",
        badges: []
      }
    },
    getBadges: async()=>{
      var badgesRef = profilesRef.child("badges")
      return (await badgesRef.get()).val()
    }
  }
}