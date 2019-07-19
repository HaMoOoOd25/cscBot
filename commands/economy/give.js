const Discord = require("discord.js");
const coinsSchema = require("../../utils/Schemas/coinsSchema");
const errors = require("../../utils/errors");

module.exports.run = (bot, message, args, messageArray) => {

    //give amount member
    if (message.author.id !== "279224191671205890" || !message.member.hasPermission('ADMINISTRATOR')) return errors.noPermissionError(message);

    if (args < 2) return errors.wrongCommandUsage(message, this.config.usage);

    const amountToadd = parseInt(args[0]);
    const member = message.mentions.members.first() || message.mentions.users.first() || message.guild.members.get(args[1]);

    if (!amountToadd) return errors.noAmountError(message);

    coinsSchema.findOne({
        guildID: message.guild.id,
        userID: member.id
    }, async (err, result) => {
        if (err) return errors.databaseError(message, err);

        if (!result){
            const newData = {
                guildID: message.guild.id,
                userID: member.id,
                coins: amountToadd
            };
            newData.save().catch(err => errors.databaseError(message, err));
        }else{
            result.coins += amountToadd;
            result.save().catch(err => errors.databaseError(message, err));
        }
        const addedEmbed = new Discord.RichEmbed()
            .setAuthor(message.author.tag, message.author.avatarURL)
            .setColor(bot.settings.embedColor)
            .setDescription(`Added ${amountToadd} coins to ${member}'s balance.`);
        message.channel.send(addedEmbed);

        try{
            await member.send(`You were given ${amountToadd} coins by ${message.author.tag}`);
        }catch (e) {}

    });
};

module.exports.config = {
    name: "give",
    usage: "give amount @someone",
    description: "Give coins to members.",
    aliases: ["transfer"],
    permission: [],
    enabled: true
};