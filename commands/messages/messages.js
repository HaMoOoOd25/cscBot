const Discord = require("discord.js");
const messageSchema = require("../../utils/Schemas/messagesSchema");
const errors = require("../../utils/errors");

module.exports.run = (bot, message, args, messageArray) => {

    const member = message.mentions.members.first() || message.mentions.users.first() || message.member;

    messageSchema.findOne({
        guildID: message.guild.id,
        userID: member.user.id
    }, (err, res) => {
        if (err) {
            errors.databaseError(message);
            return console.log(err);
        }

        if (!res || res.points === 0){
            const noMessagesEmbed = new Discord.RichEmbed()
                .setAuthor(message.author.username, message.author.avatarURL)
                .setColor(bot.settings.embedColor)
                .setDescription(`${member} has 0 points`);
            message.channel.send(noMessagesEmbed);
        }else{
            const resultsEmbed = new Discord.RichEmbed()
                .setAuthor(message.author.username, message.author.avatarURL)
                .setColor(bot.settings.embedColor)
                .setDescription(`${member} has ${res.points} points`);
            message.channel.send(resultsEmbed);
        }
    });
};

module.exports.config = {
    name: "messages",
    usage: "messages @someone",
    description: "Get amount of messages you sent or someone else by mentioning them.",
    aliases: ["message"],
    permission: [],
    enabled: true
};