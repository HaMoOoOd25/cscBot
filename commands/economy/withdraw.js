const Discord = require("discord.js");
const coinsSchema = require("../../utils/Schemas/coinsSchema");
const bankSchema = require("../../utils/Schemas/bankSchema");
const errors = require("../../utils/errors");

module.exports.run = (bot, message, args, messageArray) => {
    if (message.channel.id !== bot.settings.botCommandsChannel) return;

    let toWithdraw = 0;

    bankSchema.findOne({
        guildID: message.guild.id,
        userID: message.author.id
    }, (err, res) => {
        if (err){
            console.log(err);
            errors.databaseError(message);
        }

        if (!res || res.coins < toWithdraw){
            const noCoinsEmbed = new Discord.RichEmbed()
                .setAuthor(message.author.tag, message.author.avatarURL)
                .setColor("FF0000")
                .setDescription("You don't have anything to withdraw.");
            return message.channel.send(noCoinsEmbed);
        }else{
            if (!isNaN(args[0])){
                toWithdraw = parseInt(args[0]);
            }else{
                toWithdraw = res.coins;
            }
            if (toWithdraw <= 0) {
                const noZero = new Discord.RichEmbed()
                    .setAuthor(message.author.tag, message.author.avatarURL)
                    .setColor("FF0000")
                    .setDescription("You can't withdraw 0 or less coins!");
                return message.channel.send(noZero);
            }

            if (toWithdraw > res.coins){
                const notEnough = new Discord.RichEmbed()
                    .setAuthor(message.author.tag, message.author.avatarURL)
                    .setColor("FF0000")
                    .setDescription("You are trying to withdraw coins more than what you have.");
                return message.channel.send(notEnough);
            }

            res.coins = res.coins - toWithdraw;
            res.save().catch(err => {
                console.log(err);
                errors.databaseError(message);
            });

            coinsSchema.findOne({
                guildID: message.guild.id,
                userID: message.author.id
            }, (err, res) => {
                if (err){
                    console.log(err);
                    errors.databaseError(message);
                }

                if (!res){
                    const newData = new bankSchema({
                        guildID: message.guild.id,
                        userID: message.author.id,
                        coins: toWithdraw
                    });
                    newData.save().catch(err => {
                        console.log(err);
                        errors.databaseError(message);
                    });
                }else{
                    res.coins = res.coins + toWithdraw;
                    res.save().catch(err => {
                        console.log(err);
                        errors.databaseError(message);
                    });
                }
                const withdrawedEmbed =  new Discord.RichEmbed()
                    .setAuthor(message.author.tag, message.author.avatarURL)
                    .setColor(bot.settings.embedColor)
                    .setDescription(`${toWithdraw} coins has been moved to your wallet.`);
                message.channel.send(withdrawedEmbed);
            });
        }
    });
};

module.exports.config = {
    name: "withdraw",
    usage: "withdraw",
    description: "Withdraw your money from the bank.",
    aliases: ["with"],
    permission: [],
    enabled: true
};