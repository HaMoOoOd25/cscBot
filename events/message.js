const errors = require("../utils/errors");
const modMail = require("../utils/modMail");
const coinsPrizing = require("../utils/coinsPrize");

const pointsManager = require("../utils/pointsManagers");

module.exports = (bot, message) => {
    if (message.author.bot) return;

    //Variables declare
    let prefix = bot.config.prefix;
    let messageArray = message.content.split(" ");
    let args = messageArray.slice(1);
    let cmd = messageArray[0];

    //Mod mail
    if (message.channel.type === "dm" || message.guild === null) {
        modMail.messageReceived(message, bot);
        return;
    }

    //Commands handler
    if (message.content.startsWith(bot.config.prefix)) {
        let commandfile = bot.commands.get(cmd.slice(prefix.length)) || bot.commands.get(bot.aliases.get(cmd.slice(prefix.length)));
        if (message.channel.type === "dm") return;
        if (commandfile) {
            if (commandfile.config.enabled === false) return;
            if (!message.member.hasPermission(commandfile.config.permission)) return errors.noPermissionError(message);
            commandfile.run(bot, message, args, messageArray);
        }
    }

    //Partnership earning
    if (message.channel.id === bot.settings.partnershipChannel){
        coinsPrizing.parntership(bot, message);
    }

    //All points system goes here
    if (!message.content.startsWith(bot.config.prefix)){
        pointsManager.messagePoints(bot, message);
        pointsManager.petPoints(bot, message);
        pointsManager.housesPoints(bot, message);
    }
};