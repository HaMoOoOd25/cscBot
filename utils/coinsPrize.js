const Discord = require("discord.js");
const coinsSchema = require("./Schemas/coinsSchema");
const errors = require("./errors");

module.exports.parntership = (bot, message) => {
    const guild = message.guild;
    const pmChannel = guild.channels.get(bot.settings.pmChatChannel);
    const toEarn = 200;

    coinsSchema.findOne({
        guildID: message.guild.id,
        userID: message.author.id
    }, (err, res) => {
        if (err) return errors.databaseError(message, err);

        if (!res){
            const newData = new coinsSchema({
                guildID: guild.id,
                userID: message.author.id,
                coinsSchema: toEarn
            });
            newData.save().catch(err => errors.databaseError(message, err));
        }else{
            res.coins = res.coins + toEarn;
            res.save().catch(err => errors.databaseError(message, err));
        }

        const earnedEmbed = new Discord.RichEmbed()
            .setAuthor(message.author.tag, message.author.avatarURL)
            .setColor(bot.settings.embedColor)
            .setDescription(`Thanks for partnering with us! You have earned ${toEarn} coins!`);
       if (pmChannel){
           pmChannel.send(`${message.author}`);
           pmChannel.send(earnedEmbed);
       }
    })
};