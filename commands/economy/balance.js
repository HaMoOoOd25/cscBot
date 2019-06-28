const Discord = require("discord.js");
const coinsSchema = require("../../utils/Schemas/coinsSchema");
const errors = require("../../utils/errors");

module.exports.run = (bot, message, args, messageArray) => {
    if (message.channel.id !== bot.settings.botCommandsChannel) return;

    const member = message.mentions.members.first() || message.mentions.users.first() || message.member;

    coinsSchema.findOne({
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
                .setDescription(`${member} has 0 coins`);
            message.channel.send(noMessagesEmbed);
        }else{
            const resultsEmbed = new Discord.RichEmbed()
                .setAuthor(message.author.username, message.author.avatarURL)
                .setColor(bot.settings.embedColor)
                .setDescription(`${member} has ${res.coins} coins`);
            message.channel.send(resultsEmbed);
        }
    })
};

module.exports.config = {
    name: "balance",
    usage: "balance @someone",
    description: "Get yours or someone's balance by mentioning them.",
    aliases: ["bal", "coins", "coin"],
    permission: [],
    enabled: true
};