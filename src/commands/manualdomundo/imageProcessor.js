const {
	createCanvas,
	loadImage
} = require('canvas')
const fs = require("fs-extra")
const Discord = require('discord.js');

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

module.exports = function process(text, img_code=3) {
    return new Promise(async (resolve, reject) => {
        const canvas = createCanvas(500, 380)
        const ctx = canvas.getContext('2d')
        let pedro = fs.readdirSync(__dirname+"/files")
		pedro = pedro[Math.floor(Math.random() * pedro.length)]

        ctx.drawImage(await loadImage(__dirname + `/files/${pedro}`), 0, 0, 500,380);

        ctx.font = "500 13px Arial";
        ctx.textAlign = "left";
        ctx.fillStyle = "white";
        
        ctx.fillText(text, 8,302)
        
        resolve(new Discord.MessageAttachment(canvas.toBuffer('image/jpeg', { quality: 0.8 }), 'image.png'))   
    })

}