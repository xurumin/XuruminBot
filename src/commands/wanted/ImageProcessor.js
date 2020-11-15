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
        "otario",
        "mocreia",
        "trouxa",
        "besta",
        "freefirer",
        "corno",
        "pedro",
        "juan",
        "chifrudo",
        "amorzinho",
        "casado",
        "lindo",
        "gostosa",
        "amorzinho"
    ]
    return `${Utils.choice(sent_1)}`
}

module.exports = function process(userimageurl, username) {
    return new Promise(async (resolve, reject) => {

        const text = generatePhrase(username)

        const canvas = createCanvas(385, 500)
        const ctx = canvas.getContext('2d')
        
        ctx.drawImage(await loadImage(__dirname + `/files/base.png`), 0, 0, 385, 500);
        ctx.drawImage(await loadImage(userimageurl), 67.5, 130, 250,250);
        
        ctx.fillStyle = "black";
        ctx.textAlign = "center"
        ctx.font = "45px arialfont";
        ctx.fillText(text.toLocaleUpperCase(), 192.5, 435)
        
        resolve(new Discord.MessageAttachment(canvas.toBuffer(), 'image.png'))
    })

}