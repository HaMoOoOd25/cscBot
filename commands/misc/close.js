const Discord = require("discord.js");
const mon = require("mongoose");
const db = require("quick.db");
const errors = require("../../utils/errors");

module.exports.run = async (bot, message, args, messageArray) => {

    if (!message.channel.id === bot.settings.modMailChannel) return;

    if (args.length < 1) return errors.wrongCommandUsage(message, "close <User Id>");

    let tUserId = args[0];
    let tUser = message.guild.members.get(tUserId);


    let ticket = await db.fetch(`ticket_${tUserId}`);

    if(ticket !== null && ticket.opened === true){

        db.set(`ticket_${message.author.id}`, false);

        let deleted = new Discord.RichEmbed()
            .setAuthor(message.author.username, message.author.avatarURL)
            .setColor(bot.settings.embedColor)
            .setDescription(`Ticket for ${ticket.username} is closed!`)
            .setTimestamp(message.createdAt);
        message.channel.send(deleted);

        let notify = new Discord.RichEmbed()
            .setAuthor(tUser.user.tag, tUser.user.avatarURL)
            .setTitle("Help Session Closed")
            .setColor(bot.settings.embedColor)
            .setDescription(`This ticket has been closed.\n\n`)
            .setFooter(`Closed by ${message.author.tag}`, bot.user.avatarURL);
        try {
            await tUser.send(notify);
            tUser.user.dmChannel.stopTyping();
        } catch {}
    }else{
        let noTicket = new Discord.RichEmbed()
            .setAuthor(message.author.username, message.author.avatarURL)
            .setColor("FF0000")
            .setDescription("This user does not have an opened ticket");
        message.channel.send(noTicket).then(msg => {
            msg.delete(5000);
        })
    }
};

module.exports.config = {
    name: "close",
    usage: "close ID",
    description: "Close an open DM ticket.",
    aliases: [],
    noalias: "No Alias",
    permission: [],
    enabled: true
};