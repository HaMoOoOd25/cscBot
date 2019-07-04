const Discord = require("discord.js");
const coinsSchema = require("../../utils/Schemas/coinsSchema");
const errors = require("../../utils/errors");

module.exports.run = (bot, message, args, messageArray) => {
    if (message.channel.id !== bot.settings.botCommandsChannel) return;

    //donate amount @someone
    if (args.length < 2 || message.mentions.members < 1) return errors.wrongCommandUsage(message, "donate <amount> @someone");

    const toDonate = message.mentions.members.first() || message.mentions.users.first();
    //If user not found
    if (!toDonate) return errors.noUserError(message);

    const toDonateAmt = parseInt(args[0]);
    if (!toDonateAmt) return errors.noAmountError(message);

    if (toDonate.id === message.author.id) return errors.yourselfError(message);

    coinsSchema.findOne({
        guildID: message.guild.id,
        userID: message.author.id
    }, (err, res) => {
        if (err) {
            errors.databaseError(message);
            console.log(err);
        }

        if (toDonateAmt <= 0) {
            const noZero = new Discord.RichEmbed()
                .setAuthor(message.author.tag, message.author.avatarURL)
                .setColor("FF0000")
                .setDescription("You can't donate 0 or less coins!");
            return message.channel.send(noZero);
        }

        if (!res || res.coins < toDonateAmt) {
            const noEnoughEmbed = new Discord.RichEmbed()
                .setAuthor(message.author.username, message.author.avatarURL)
                .setColor("#FF0000")
                .setDescription(`You don't have enough coins to donate to ${toDonate}`);
            message.channel.send(noEnoughEmbed);
            return;
        }

        res.coins = res.coins - toDonateAmt;
        res.save().catch(err => {
            errors.databaseError(message);
            console.log(err);
        });

        //Getting donated person info
        coinsSchema.findOne({
            guildID: message.guild.id,
            userID: toDonate.user.id
        }, (err, res) => {
            if (err) {
                errors.databaseError(message);
                console.log(err);
            }

            if (!res) {
                const newData = new coinsSchema({
                    guildID: message.guild.id,
                    userID: toDonate.user.id,
                    coins: toDonateAmt
                });
                newData.save().catch(err => {
                    errors.databaseError(message);
                    console.log(err);
                });
            }else{
                res.coins = res.coins + toDonateAmt;
                res.save().catch(err => {
                    errors.databaseError(message);
                    console.log(err);
                });
            }

            const donatedEmbed = new Discord.RichEmbed()
                .setAuthor(message.author.username, message.author.avatarURL)
                .setDescription(`${message.author}, you have donated ${toDonateAmt} to ${toDonate}.`)
                .setColor(bot.settings.embedColor);
            message.channel.send(donatedEmbed);
        });
    });


};

module.exports.config = {
    name: "donate",
    usage: "give amount @someone",
    description: "Donate coins to a member in the server.",
    aliases: ["transfer"],
    permission: [],
    enabled: true
};