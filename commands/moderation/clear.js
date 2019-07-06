module.exports.run = (bot, message, args, messageArray) => {
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