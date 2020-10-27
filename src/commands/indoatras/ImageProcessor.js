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

//var color_list = ["#faf62d", "white", "#8a5af2"]

module.exports = function process(text, whathedodoes) {
    return new Promise(async (resolve, reject) => {
        const canvas = createCanvas(400, 450)
        const ctx = canvas.getContext('2d')

        var file = fs.readdirSync(__dirname+"/files")
        file = file[Math.floor(Math.random() * file.length)]

        ctx.drawImage(await loadImage(__dirname + `/files/${file}`), 0, 50, 400,350);

        ctx.fillRect(0,0,400, 90)
        ctx.fillRect(0,370,400, 80)

        ctx.fillStyle = "white";
        ctx.font = "36px Arial";
        ctx.textAlign = "center"
        ctx.fillText("indo atrás desse tal de", 200, 40)

        wrapText(ctx, whathedodoes, 200 ,410, 30 ,380)
        
        
        wrapText(ctx, text, 200,73, 18 ,480)
        
        resolve(new Discord.MessageAttachment(canvas.toBuffer(), 'image.png'))
    })

}