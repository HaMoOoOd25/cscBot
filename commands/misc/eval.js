const Discord = require("discord.js");
const { inspect } = require("util");


const developerID = "279224191671205890";
module.exports.run = (bot, message, args, messageArray) => {

    if (message.author.id === developerID){
        let toEval = args.join(" ");
        let evaluated = inspect(eval(toEval, { depth: 0} ));
        try {
            if(toEval){
                let hrStart = process.hrtime();
                let hrDiff;
                hrDiff = process.hrtime(hrStart);
                return message.channel.send(`*Executed in ${hrDiff[0] > 0 ? `${hrDiff[0]}s` : ''}${hrDiff[1] / 1000000}ms.*\`\`\`javascript\n${evaluated}\n\`\`\``);
            }else{
                message.channel.send("Error whilst evaluating: `Number of args for evaluation is less than 1`")
            }
        }catch (e) {
            message.channel.send(`Error whilst evaluating: \`${e.message}\``);
        }
    }else{
        return message.reply(" you can't use this command.");
    }
};

module.exports.config = {
    name : "eval",
    usage: "No",
    description: "This command is locked to be used only by HaMoOoOd25#7712.",
    aliases: [],
    noalias: "No Alias",
    permission: [],
    enabled: true
};