const Discord = require("discord.js");
const errors = require("../../utils/errors");
const db = require("quick.db");

module.exports.run = async (bot, message, args, messageArray) => {
    if (!message.channel.id === bot.settings.modMailChannel) return;

    if (args.length < 2) return errors.wrongCommandUsage(message, "close <User Id>");


    //-reply id
    let tUserId = args[0];
    let tUser = message.guild.members.get(tUserId);
    let content = args.slice(1).join(" ");

    let ticket = await db.fetch(`ticket_${tUserId}`);

    if(ticket !== null && ticket.opened === true){
        message.reply(" message sent ✅").then(msg => {
            msg.delete(5000);
        });
        let messageEmbed = new Discord.RichEmbed()
            .setAuthor(message.author.tag, message.author.avatarURL)
            .setColor(bot.settings.embedColor)
            .setDescription(content)
            .setFooter("Reply to confirm your message to the staff members", bot.user.avatarURL);
        try{
            await tUser.send(messageEmbed);
            tUser.user.dmChannel.stopTyping();
        }catch{
        }
    }else{
        let noTicket = new Discord.RichEmbed()
            .setAuthor(message.author.username, message.author.avatarURL)
            .setColor("FF0000")
            .setDescription("This user does not have an opened ticket");
        message.channel.send(noTicket).then(msg => {
            msg.delete(5000);
        });
    }
};

module.exports.config = {
    name : "reply",
    usage: "reply ID",
    description: "Reply to an open DM ticket.",
    aliases: ["answer"],
    permission: [],
    enabled: true
};