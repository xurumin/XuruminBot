const {
	createCanvas,
	loadImage
} = require('canvas')
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
        const canvas = createCanvas(500, 240)
        const ctx = canvas.getContext('2d')
        var imageHeight=240;

        if(img_code==1) imageHeight=198;
        if(img_code==2) imageHeight=222;

        ctx.drawImage(await loadImage(__dirname + `/files/base_${img_code}.png`), 0, 0, 500,imageHeight);
 
        ctx.fillStyle = "white";
        ctx.font = "13px Arial";
        wrapText(ctx, text, 24,73, 18 ,452)
        
        resolve(new Discord.MessageAttachment(canvas.toBuffer(), 'image.png'))
    })

}