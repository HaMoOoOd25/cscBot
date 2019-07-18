const Discord = require("discord.js");
const coinsSchema = require("../../utils/Schemas/coinsSchema");
const errors = require("../../utils/errors");
const db = require("quick.db");
const ms = require("parse-ms");

module.exports.run = async (bot, message, args, messageArray) => {
    if (message.channel.id !== bot.settings.botCommandsChannel) return;

    if (message.mentions.members < 1 || args < 1) return errors.wrongCommandUsage(message, "rob @someone");

    const cooldown = 2.16e+7;
    let lastDaily = await db.fetch(`lastRob_${message.author.id}`);
    if(lastDaily !== null && cooldown - (Date.now() - lastDaily) > 0){
        let timeObj = ms(cooldown - (Date.now() - lastDaily));
        const coolDownEmbed = new Discord.RichEmbed()
            .setAuthor(message.author.tag, message.author.avatarURL)
            .setColor("FF0000")
            .setDescription(`You have to wait **${timeObj.hours}h ${timeObj.minutes}m ${timeObj.seconds}s** before robbing again.`);
        return message.channel.send(coolDownEmbed);
    }
    db.set(`lastRob_${message.author.id}`, Date.now());

    const toRob = message.mentions.members.first() || message.mentions.users.first();
    //If user not found
    if (!toRob) return errors.noUserError(message);

    if (toRob.id === message.author.id) return errors.yourselfError(message);

    let detector;
    let random = Math.floor(Math.random() * 2);

    switch (random) {
        case 0:
            detector = "fail";
            break;
        case 1:
            detector = "success";
            break;

    }

    //The amount of coins to deduct from robbed person and give to the robber
    let toDeduct = 0;

    //Getting the robbed person info
    coinsSchema.findOne({
        guildID: message.guild.id,
        userID: toRob.user.id
    }, (err, res) => {
        if (err) {
            errors.databaseError(message);
            return console.log(err);
        }

        if (!res || res.coins < 1) {
            const robFailEmbed = new Discord.RichEmbed()
                .setAuthor(message.author.username, message.author.avatarURL)
                .setColor("FF0000")
                .setDescription(`You found nothing with ${toRob}.`);
            message.channel.send(robFailEmbed);
            return;
        }

        if (detector === "success"){
            //We want to get from 15 to 25 %
            let percentage = Math.random() * (0.25 - 0.15) + 0.15;
            toDeduct = Math.floor(res.coins * percentage);

            res.coins = res.coins - toDeduct;
            res.save().catch(err => {
                errors.databaseError(message);
                console.log(err);
            });
        }

        coinsSchema.findOne({
            guildID: message.guild.id,
            userID: message.author.id
        }, (err, res) => {
            if (err) {
                errors.databaseError(message);
                return console.log(err);
            }

            if (detector === "fail"){

                let fine;
                if (!res){
                    fine = 0;
                }else{
                    fine = Math.floor((res.coins || 0) * 0.25);
                    res.coins = res.coins - fine;
                    res.save().catch(err => {
                        errors.databaseError(message);
                        console.log(err);
                    });
                }
                const robFailEmbed = new Discord.RichEmbed()
                    .setAuthor(message.author.username, message.author.avatarURL)
                    .setColor("FF0000")
                    .setDescription(`You got busted and fined ${fine} coins.`);
                message.channel.send(robFailEmbed);
                return;
            }

            if (!res){
                const newData = coinsSchema({
                    guildID: message.guild.id,
                    userID: message.author.id,
                    coins: toDeduct
                });
                newData.save().catch(err => {
                    errors.databaseError(message);
                    console.log(err);
                });
            }else{
                res.coins = res.coins + toDeduct;
                res.save().catch(err => {
                    errors.databaseError(message);
                    console.log(err);
                });
            }
            const EarnedEmbed = new Discord.RichEmbed()
                .setAuthor(message.author.username, message.author.avatarURL)
                .setDescription(`${message.author}, you have robbed ${toDeduct} from ${toRob}.`)
                .setColor(bot.settings.embedColor);
            message.channel.send(EarnedEmbed);
        })

    });


};

module.exports.config = {
    name: "rob",
    usage: "rob @someone",
    description: "Rob a member's coins in the server.",
    aliases: ["steal"],
    permission: [],
    enabled: true
};