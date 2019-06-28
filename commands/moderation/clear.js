const Discord = require("discord.js");
const errors = require("../../utils/errors");
module.exports.run = (bot, message, args, messageArray) => {

    if(args[0] > 100) return message.reply(" numbers of messages must be less than 100").then(msg => msg.delete(3000));

    let counter = 0;

    message.channel.fetchMessages({
        limit: 100
    }).then(msgs => {
        const filteredmsgs = msgs.filter(msg => msg.author.bot || msg.content.startsWith(bot.config.prefix));
        message.channel.bulkDelete(filteredmsgs, true);
    });
};

module.exports.config = {
    name: "clear",
    usage: "purge",
    description: "Clear commands and messages send by bots.",
    aliases: ["purge"],
    permission: ["MANAGE_MESSAGES"],
    enabled: true
};