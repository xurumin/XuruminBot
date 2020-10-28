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
            // Determine how much of the word will fit
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

module.exports = function process(philosopher_name, philosopher_pic, text) {
    return new Promise(async (resolve, reject) => {
        const canvas = createCanvas(600, 315)
        const ctx = canvas.getContext('2d')

        let philosopher_image;
        if(philosopher_pic.startsWith("http")){
            philosopher_image = await loadImage(philosopher_pic)
        }else{
            philosopher_image = await loadImage(__dirname + philosopher_pic)
        }

        ctx.drawImage(await loadImage(__dirname + "/files/base.png"), 0, 0, 600,315);
        ctx.drawImage(philosopher_image, 0, 0, 242,315);
        

        ctx.fillStyle = "white";
        ctx.font = "18px Arial";
        wrapText(ctx, text, 260,60, 25, 330)
        
        ctx.font = "22px Times New Roman";
        ctx.fillStyle = "gray";
        ctx.fillText(philosopher_name, 260, 290)

        resolve(new Discord.MessageAttachment(canvas.toBuffer(), 'image.png'))
    })

}