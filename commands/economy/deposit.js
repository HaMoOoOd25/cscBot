const Discord = require("discord.js");
const coinsSchema = require("../../utils/Schemas/coinsSchema");
const bankSchema = require("../../utils/Schemas/bankSchema");
const errors = require("../../utils/errors");

module.exports.run = (bot, message, args, messageArray) => {
    if (message.channel.id !== bot.settings.botCommandsChannel) return;

    //deposit amount
    let toDeposit = 0;

    let balance = 0;
    let bank = 0;

    coinsSchema.findOne({
        guildID: message.guild.id,
        userID: message.author.id
    }, (err, walletRes) => {
        if (err) return errors.databaseError(message, err);

        if (!walletRes || walletRes.coins < 1) {

            const noCoinsEmbed = new Discord.RichEmbed()
                .setAuthor(message.author.tag, message.author.avatarURL)
                .setColor("FF0000")
                .setDescription("You don't have anything to deposit.");
            message.channel.send(noCoinsEmbed);

        }
        else {

            if (args[0] === "all"){
                toDeposit = walletRes.coins;
            }
            else if (!isNaN(args[0])){
                toDeposit = parseInt(args[0]);
            }
            else{
                return errors.wrongCommandUsage(message, this.config.usage)
            }

            if (toDeposit <= 0) {
                const noZero = new Discord.RichEmbed()
                    .setAuthor(message.author.tag, message.author.avatarURL)
                    .setColor("FF0000")
                    .setDescription("You can't deposit 0 or less coins!");
                return message.channel.send(noZero);
            }

            if (toDeposit > walletRes.coins){
                const notEnough = new Discord.RichEmbed()
                    .setAuthor(message.author.tag, message.author.avatarURL)
                    .setColor("FF0000")
                    .setDescription("You are trying to deposit coins more than what you have.");
                return message.channel.send(notEnough);
            }

            walletRes.coins = walletRes.coins - toDeposit;

            walletRes.save().catch(err => errors.databaseError(message, err));

            bankSchema.findOne({
                guildID: message.guild.id,
                userID: message.author.id
            }, (err, bankRes) => {
                if (err) return errors.databaseError(message, err);

                if (!bankRes){
                    console.log("1");
                    const newData = new bankSchema({
                        guildID: message.guild.id,
                        userID: message.author.id,
                        coins: toDeposit
                    });
                    newData.save().catch(err => {
                        console.log(err);
                        errors.databaseError(message);
                    });
                    bank = toDeposit;
                }else{
                    bankRes.coins = bankRes.coins + toDeposit;
                    bankRes.save().catch(err => errors.databaseError(message, err));
                    bank = bankRes.coins;
                }
                balance = walletRes.coins;
                const depositedEmbed =  new Discord.RichEmbed()
                    .setAuthor(message.author.tag, message.author.avatarURL)
                    .setTitle("Deposit")
                    .setColor(bot.settings.embedColor)
                    .setDescription(`💰 **Wallet:** \`${balance}\` \n🏦 **Bank:** \`${bank}\` \n💳 **Deposited:** \`${toDeposit}\``);
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