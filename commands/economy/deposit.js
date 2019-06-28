const Discord = require("discord.js");
const coinsSchema = require("../../utils/Schemas/coinsSchema");
const bankSchema = require("../../utils/Schemas/bankSchema");
const errors = require("../../utils/errors");

module.exports.run = (bot, message, args, messageArray) => {
    if (message.channel.id !== bot.settings.botCommandsChannel) return;

    //deposit amount
    let toDeposit = 0;

    coinsSchema.findOne({
        guildID: message.guild.id,
        userID: message.author.id
    }, (err, res) => {
        if (err){
            console.log(err);
            errors.databaseError(message);
        }

        if (!res || res.coins < 1){
            const noCoinsEmbed = new Discord.RichEmbed()
                .setAuthor(message.author.tag, message.author.avatarURL)
                .setColor("FF0000")
                .setDescription("You don't have anything to deposit.");
            message.channel.send(noCoinsEmbed);
        }else{
            if (!isNaN(args[0])){
                toDeposit = parseInt(args[0]);
            }else{
                toDeposit = res.coins;
            }
            if (toDeposit <= 0) {
                const noZero = new Discord.RichEmbed()
                    .setAuthor(message.author.tag, message.author.avatarURL)
                    .setColor("FF0000")
                    .setDescription("You can't deposit 0 or less coins!");
                return message.channel.send(noZero);
            }

            if (toDeposit > res.coins){
                const notEnough = new Discord.RichEmbed()
                    .setAuthor(message.author.tag, message.author.avatarURL)
                    .setColor("FF0000")
                    .setDescription("You are trying to deposit coins more than what you have.");
                return message.channel.send(notEnough);
            }

            res.coins = res.coins - toDeposit;
            res.save().catch(err => {
                console.log(err);
                errors.databaseError(message);
            });

            bankSchema.findOne({
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
                        coins: toDeposit
                    });
                    newData.save().catch(err => {
                        console.log(err);
                        errors.databaseError(message);
                    });
                }else{
                    res.coins = res.coins + toDeposit;
                    res.save().catch(err => {
                        console.log(err);
                        errors.databaseError(message);
                    });
                }
                const depositedEmbed =  new Discord.RichEmbed()
                    .setAuthor(message.author.tag, message.author.avatarURL)
                    .setColor(bot.settings.embedColor)
                    .setDescription(`${toDeposit} coins has been moved to your bank.`);
                message.channel.send(depositedEmbed);
            });
        }
    });
};

module.exports.config = {
    name: "deposit",
    usage: "deposit amount",
    description: "Deposit your money into the bank to keep it safe.",
    aliases: ["dep"],
    permission: [],
    enabled: true
};