const Discord = require("discord.js");
const settings = require("../settings.json");
const db = require("quick.db");
const errors = require("./errors");

module.exports.messageReceived = async (message, bot) => {

    let guild = bot.guilds.get(settings.guildID);
    let modMailChannel = guild.channels.find(channel => channel.id === bot.settings.modMailChannel);

    let NotifyEmbed = new Discord.RichEmbed()
        .setColor(settings.embedColor)
        .setAuthor(message.author.tag, message.author.avatarURL)
        .setTimestamp(message.createdAt)
        .setDescription(`**${bot.config.prefix}reply ${message.author.id} content**`)
        .addField("Message", message.content, false)
        .setFooter("Hold on the commands to copy it.");

    let ticket = await db.fetch(`ticket_${message.author.id}`);

    if(ticket !== null && ticket.opened === true){
        //if open ticket was found
        await message.react('✅');
        const filter = (reaction, user) => reaction.emoji.name === '✅' && !user.bot;
        //Confirm that user wants to send that message.
        await message.awaitReactions(filter, {
            max: 1
        }).then(collected => {
            if (collected.first().emoji.name === '✅'){
                modMailChannel.send(NotifyEmbed);
                message.author.dmChannel.startTyping();
            }
        });
    }else{
        let newTicketEmbed = new Discord.RichEmbed()
            .setAuthor(message.author.tag, message.author.avatarURL)
            .setTitle("Help Ticket Started")
            .setColor(settings.embedColor)
            .setDescription(`${message.author}, your ticket will seen by our staff soon. Please remain patient until we get in touch with you!`)
            .setFooter("Reply to confirm your message to the staff.", bot.user.avatarURL);
        try{
            await message.author.send(newTicketEmbed);
        }catch{}

        modMailChannel.send(NotifyEmbed);
        message.author.dmChannel.startTyping();
        db.set(`ticket_${message.author.id}`, {username: message.author.tag, opened: true});
    }
};