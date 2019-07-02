const Discord = require("discord.js");
const errors = require("../../utils/errors");
const fs = require("fs");

module.exports.run = async (bot, message, args, messageArray) => {

    await message.delete();

    const supportEmbed = new Discord.RichEmbed()
        .setAuthor(message.author.username, message.author.avatarURL)
        .setColor(bot.settings.embedColor)
        .addField('Support', "You can always help keeping the bot going but donating to my Patreon [here](https://www.patreon.com/HaMoOoOd25) or https://www.patreon.com/HaMoOoOd25.")
        .setFooter(bot.user.username, bot.user.avatarURL)
        .setTimestamp(message.createdAt);
    message.channel.send(supportEmbed);

};

module.exports.config = {
    name : "support",
    usage: "support",
    description: "Get donation info.",
    aliases: [],
    noalias: "No Alias",
    permission: [],
    enabled: true
};