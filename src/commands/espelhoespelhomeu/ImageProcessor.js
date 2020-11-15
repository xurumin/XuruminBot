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
        "mo mocreia",
        "kkkkkkkkkkkk ainda pergunta kkkkkkkkkk",
        "tem espelho em casa nao? kkkkkkk",
        "parece uma largatixa",
        "rachei lkklkkkkkkkkkkkk",
        "mo gostosa slc",
        "kkkkkkkkkkkkkkkkkkkkkkkkkk",
        "n vo nem responde",
        "só rindo mesmo",
        "feia é pouco",
        "mo cara de tamandua",
        "ja pensou em usar um saco na cara nao?",
        "ave maria que susto",
        "que susto",
        "cruzes",
        "temq melhorar mt pra ser feia",
        "ta de parabens ó que gatinha",
        "sonho",
        "com uma deusa grega dessa eu ate deixo de ser ateu",
        "p*ta que me pariu que xuxu",
        "p*ta que me pariu que coisa feia",
        "avemaria",
        "risos"
    ]
    return `${Utils.choice(sent_1)}`
}

module.exports = function process(userimageurl, username) {
    return new Promise(async (resolve, reject) => {

        const text = generatePhrase(username)

        const canvas = createCanvas(525, 324)
        const ctx = canvas.getContext('2d')
        
        ctx.drawImage(await loadImage(__dirname + `/files/base.png`), 0, 0, 525,324);
        ctx.drawImage(await loadImage(userimageurl), 316, 48, 50,50);
        
        ctx.fillStyle = "white";
        
        let x = 160
        let y = 280
        ctx.translate(x,y);
        ctx.textAlign = "center"
        ctx.rotate(-5 * Math.PI / 180)
        ctx.font = "20px arialfont";
        wrapText(ctx, text, 0,0, 20 ,270)
        
        resolve(new Discord.MessageAttachment(canvas.toBuffer(), 'image.png'))
    })

}