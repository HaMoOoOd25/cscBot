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
    }, (err, bankRes) => {
        if (err){
            console.log(err);
            return errors.databaseError(message);
        }

        if (!bankRes || bankRes.coins < toWithdraw){
            const noCoinsEmbed = new Discord.RichEmbed()
                .setAuthor(message.author.tag, message.author.avatarURL)
                .setColor("FF0000")
                .setDescription("You don't have anything to withdraw.");
            return message.channel.send(noCoinsEmbed);
        }else{
            if (args[0] === "all"){
                toWithdraw = bankRes.coins;
            }
            else if (!isNaN(args[0])){
                toWithdraw = parseInt(args[0]);
            }else{
                return errors.wrongCommandUsage(message, this.config.usage);
            }
            if (toWithdraw <= 0) {
                const noZero = new Discord.RichEmbed()
                    .setAuthor(message.author.tag, message.author.avatarURL)
                    .setColor("FF0000")
                    .setDescription("You can't withdraw 0 or less coins!");
                return message.channel.send(noZero);
            }

            if (toWithdraw > bankRes.coins){
                const notEnough = new Discord.RichEmbed()
                    .setAuthor(message.author.tag, message.author.avatarURL)
                    .setColor("FF0000")
                    .setDescription("You are trying to withdraw coins more than what you have.");
                return message.channel.send(notEnough);
            }

            bankRes.coins = bankRes.coins - toWithdraw;
            bankRes.save().catch(err => {
                console.log(err);
                errors.databaseError(message);
            });

            coinsSchema.findOne({
                guildID: message.guild.id,
                userID: message.author.id
            }, (err, walletRes) => {
                if (err){
                    console.log(err);
                    return errors.databaseError(message);
                }

                if (!walletRes){
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
                    walletRes.coins = walletRes.coins + toWithdraw;
                    walletRes.save().catch(err => {
                        console.log(err);
                        errors.databaseError(message);
                    });
                }
                const withdrawdEmbed =  new Discord.RichEmbed()
                    .setAuthor(message.author.tag, message.author.avatarURL)
                    .setTitle("Withdraw")
                    .setColor(bot.settings.embedColor)
                    .setDescription(`💰 **Wallet:** \`${walletRes.coins}\` \n🏦 **Bank:** \`${bankRes.coins}\` \n💵 **Withdrawn:** \`${toWithdraw}\``);
                message.channel.send(withdrawdEmbed);
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