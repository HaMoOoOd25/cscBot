const Discord = require("discord.js");
const errors = require("../../utils/errors");
const fs = require("fs");

module.exports.run = async (bot, message, args, messageArray) => {

    //If not me <3
    if (message.author.id !== "279224191671205890") return errors.noPermissionError(message);

    await message.delete();

    const changeLogText = fs.readFileSync(require('path').resolve(__dirname, '../../changelog.txt')).toString('utf-8');
    const changelogEmbed = new Discord.RichEmbed()
        .setAuthor(message.author.username, message.author.avatarURL)
        .setColor(bot.settings.embedColor)
        .addField(`${bot.user.username} Update!`, "We've got some new features for you!")
        .addField('Overview', changeLogText)
        .addField('Support the bot', "You can always help keeping the bot going but donating to my Patreon [here](https://www.patreon.com/HaMoOoOd25).")
        .setFooter(bot.user.username, bot.user.avatarURL)
        .setTimestamp(message.createdAt);
    message.channel.send(changelogEmbed)

};

module.exports.config = {
    name : "update",
    usage: "update",
    description: "This command can only be used by HaMoOoOd25#7712. It show's the bot changelogs",
    aliases: ["changelog"],
    permission: [],
    enabled: true
};