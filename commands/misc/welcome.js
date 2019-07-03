const Discord = require("discord.js");
const errors = require("../../utils/errors");
const fs = require("fs");
const path = require("path");

module.exports.run = async (bot, message, args, messageArray) => {
    //.welcome #channel

    if (args.length < 1 || message.mentions.channels.size < 1 || !message.mentions.channels) return errors.wrongCommandUsage(message, this.config.usage);

    const welcomeChannel = message.mentions.channels.first();

    const settingsFile = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../settings.json')).toString());
    settingsFile.welcomeChannel = welcomeChannel.id;


    fs.writeFile(path.join(__dirname, '../../settings.json'), JSON.stringify(settingsFile, null, 2), function (err, result) {
        if (err) console.log('error', err)

        const changedEmed = new Discord.RichEmbed()
            .setAuthor(message.author.username, message.author.avatarURL)
            .setColor(bot.settings.embedColor)
            .setDescription(`Welcome channel has been changed into ${welcomeChannel}`);
        message.channel.send(changedEmed);
    });
};

module.exports.config = {
    name : "welcome",
    usage: "welcome #channel",
    description: "Change the channel where the welcome messages will be sent.",
    aliases: ["wlmessage"],
    permission: ["ADMINISTRATOR"],
    enabled: true
};