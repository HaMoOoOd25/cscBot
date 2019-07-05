const Discord = require("discord.js");
const bankSchema = require("../../utils/Schemas/bankSchema");
const errors = require("../../utils/errors");

module.exports.run = (bot, message, args, messageArray) => {

    if (message.channel.id !== bot.settings.botCommandsChannel) return;

    const member = message.mentions.members.first() || message.mentions.users.first() || message.member;

    bankSchema.findOne({
        guildID: message.guild.id,
        userID: member.user.id
    }, (err, res) => {
        if (err) {
            errors.databaseError(message);
            console.log(err);
        }

        if (!res || res.coins === 0){
            const noMessagesEmbed = new Discord.RichEmbed()
                .setAuthor(message.author.username, message.author.avatarURL)
                .setColor(bot.settings.embedColor)
                .setDescription(`${member} has 0 coins in their bank`);
            message.channel.send(noMessagesEmbed);
        }else{
            const resultsEmbed = new Discord.RichEmbed()
                .setAuthor(message.author.username, message.author.avatarURL)
                .setColor(bot.settings.embedColor)
                .setDescription(`${member} has ${res.coins} coins in their bank.`);
            message.channel.send(resultsEmbed);
        }
    })
};

module.exports.config = {
    name: "bank",
    usage: "bank @someone",
    description: "Get yours or someone's balance in bank by mentioning them.",
    aliases: [],
    noalais: "No alias",
    permission: [],
    enabled: true
};