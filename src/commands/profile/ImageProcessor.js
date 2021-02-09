const {
	createCanvas,
    loadImage,
    registerFont
} = require('canvas')


require('dotenv/config');
const fs = require("fs-extra")
const Discord = require('discord.js');

fs.readdirSync(__dirname+"/fonts").forEach(file=>{
    registerFont(__dirname+"/fonts/"+file, {family: file.split(".")[0]})
})

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
function roundedImage(ctx,x,y,width,height,radius){
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }


module.exports = function process(user_img, user, profile, LOCALE) {
    return new Promise(async (resolve, reject) => {

        const canvas = createCanvas(736, 455)
        const ctx = canvas.getContext('2d')


        var badges = []
        if(profile.badges) badges=profile.badges

        var bg = await loadImage(profile.bg_url)
        ctx.drawImage(bg, 0, 0, 736,bg.height); //background

        ctx.drawImage(await loadImage(__dirname + `/base.png`),0, 0, 736,455); //base

        for(var i = 0; i < badges.length; i++){
            ctx.drawImage(await loadImage(badges[i].img_url), 226+(i*45), 118, badges[i].w,badges[i].h);
        }

        ctx.save();
        roundedImage(ctx,35, 28, 171,171,95);
        ctx.clip();
        ctx.drawImage(await loadImage(user_img), 35, 28, 171,171); //user profile
        ctx.restore();



        //Name
        ctx.font = "40px Montserrat-SemiBold";
        ctx.textAlign = "left";
        ctx.fillStyle = "white";
        var nameWidth = ctx.measureText(user.username).width
        ctx.fillText(user.username, 227, 81)
        
        //Id
        ctx.font = "20px Montserrat-Regular";
        ctx.textAlign = "left";
        ctx.fillStyle = "white";
        ctx.fillText("#"+user.tag.split("#")[user.tag.split("#").length-1], 227+nameWidth+2, 67)
        
        //About me
        ctx.font = "22px Montserrat-SemiBold";
        ctx.textAlign = "left";
        ctx.fillStyle = "black";
        ctx.fillText(LOCALE.aboutme, 35, 280)
        
        //Level
        ctx.font = "20px Montserrat-Bold";
        ctx.textAlign = "left";
        ctx.fillStyle = "#EAD552";
        ctx.fillText(`Level ${profile.level}`, 608, 70)
        
        //points
        ctx.font = "20px Montserrat-Bold";
        ctx.textAlign = "left";
        ctx.fillStyle = "#EAD552";
        ctx.fillText(`${parseFloat(profile.points * process.env.MESSAGE_POINT_X).toFixed(0)} XP`, 608, 110)
        
        //Text about me
        ctx.font = "18px Montserrat-Regular";
        ctx.textAlign = "left";
        ctx.fillStyle = "black";
        wrapText(ctx, profile.aboutme, 35,311,27,650)
        
        resolve(new Discord.MessageAttachment(canvas.toBuffer(), 'image.png'))
    })

}