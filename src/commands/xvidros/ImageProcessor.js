const {
	createCanvas,
    loadImage,
    registerFont
} = require('canvas')
const Utils = require("./../../utils/utils")
const Discord = require('discord.js');
registerFont(__dirname+"./../../files/Arial.ttf", {family: "arialfont"})

function wrapText (context, text, x, y, lineHeight, maxWidth) {
    var words = text.split(' '),
        line = '',
        lineCount = 0,
        i,
        test,
        metrics;

    for (i = 0; i < words.length; i++) {
        test = words[i];
        metrics = context.measureText(test);
        while (metrics.width > maxWidth) {
            test = test.substring(0, test.length - 1);
            metrics = context.measureText(test);
        }
        if (words[i] != test) {
            words.splice(i + 1, 0,  words[i].substr(test.length))
            words[i] = test;
        }  

        test = line + words[i] + ' ';  
        metrics = context.measureText(test);
        
        if (metrics.width > maxWidth && i > 0) {
            context.fillText(line, x, y);
            line = words[i] + ' ';
            y += lineHeight;
            lineCount++;
        }
        else {
            line = test;
        }
    }
            
    context.fillText(line, x, y);
}

function generatePhrase(username){
    //text lenght: 81 chars
    const sent_1 = [
        "jovem",
        username,
        "estranho",
        "milf",
        "coroa",
        "jogador de fogaréu gratuito",
        "kpoper",
        "velho de 69 anos",
        "pedro",
        "professor de educação fisica",
        "cantor de sertenejo",
        "estudante",
        "medico",
        "doido da esquina",
        "fã do felipe neto",
        "streamer",
        "streamer de lol",
        "youtuber",
        "youtuber de minecraft"
    ]
    const sent_2 = [
        "estava jogando lol",
        "sentou na vassoura",
        "estava ouvindo sertanejo",
        "estava lambendo um cachorro",
        "estava travando zap da moça",
        "estava travando zap",
        "tomou a azulzinha",
        "tomou 37 azulzinhas",
        "fumou umas",
        "tomou umas",
        "estava assistindo o felipe neto"
    ]
    const sent_3 = [
        "quando chegou o corno",
        "quando quebrou a cara",
        "quando foi preso",
        "quando morreu de overdose",
        "e morreu de amor",
        "e enfartou",
        "e enfartou no motel",
        "e morreu",
        "e pediu o estorno da dama",
        "enquanto a mulher tava em casa",
        "enquanto o corno filmava",
        "enquanto o corno jogava free fire",
        "enquanto o corno assistia felipe neto",
        "enquanto o corno militava no twitter",
        "enquanto o corno assistia viniccius 13",
        "enquanto curtia a dedada",
        "enquanto curtia o chifre",
        "enquanto curtia a p*taria",
        
    ]
    return `${Utils.choice(sent_1)} ${Utils.choice(sent_2)} ${Utils.choice(sent_3)}`
}

module.exports = function process(userimageurl, username) {
    return new Promise(async (resolve, reject) => {

        const text = generatePhrase(username)

        const canvas = createCanvas(530, 436)
        const ctx = canvas.getContext('2d')

        ctx.drawImage(await loadImage(userimageurl), 10, 130, 510,250);
        ctx.drawImage(await loadImage(__dirname + `/files/base.png`), 0, 0, 530,436);
        
        ctx.fillStyle = "black";
        ctx.font = "bold 22px arialfont";
        wrapText(ctx, text, 12,28, 25 ,516)
        
        resolve(new Discord.MessageAttachment(canvas.toBuffer('image/jpeg', { quality: 0.8 }), 'image.png'))   
    })

}