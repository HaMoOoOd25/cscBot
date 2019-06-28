const Discord = require("discord.js");
const coinsSchema = require("../../utils/Schemas/coinsSchema");
const errors = require("../../utils/errors");
const db = require("quick.db");
const ms = require("parse-ms");

module.exports.run = async (bot, message, args, messageArray) => {
    if (message.channel.id !== bot.settings.botCommandsChannel) return;

    //Cooldown
    const cooldown = 2.16e+7;
    let lastDaily = await db.fetch(`lastWork_${message.author.id}`);
    if(lastDaily !== null && cooldown - (Date.now() - lastDaily) > 0){
        let timeObj = ms(cooldown - (Date.now() - lastDaily));
        const coolDownEmbed = new Discord.RichEmbed()
            .setAuthor(message.author.tag, message.author.avatarURL)
            .setColor("FF0000")
            .setDescription(`You have to wait **${timeObj.hours}h ${timeObj.minutes}m ${timeObj.seconds}s** before working again.`);
        return message.channel.send(coolDownEmbed);
    }
    db.set(`lastWork_${message.author.id}`, Date.now());

    //Get some jobs
    const jobs = ["developer", "designer", "pizza delivery guy", "streamer", "teacher", "cop", "programmer", "doctor",
    "scientist", "researcher", "sales man", "cashier", "bodyguard"];

    //Get a random job
    const randomJob = Math.floor(Math.random() * jobs.length);

    //The earning range 250-750
    const min = Math.ceil(250);
    const max = Math.floor(750 + 1);
    const toEarn = Math.floor(Math.random() * (max - min) + min);

    //Preparing the embed
    const jobEmbed = new Discord.RichEmbed()
        .setAuthor(message.author.tag, message.author.avatarURL)
        .setColor(bot.settings.embedColor)
        .setDescription(`You worked as a **${jobs[randomJob]}** and earned **${toEarn}** coins.`);

    coinsSchema.findOne({
        guildID: message.guild.id,
        userID: message.author.id
    }, (err, res) => {
        if (err) {
            console.log(err);
            errors.databaseError(message);
        }

        if (!res) {
            const newData = new coinsSchema({
                guildID: message.guild.id,
                userID: message.author.id,
                coins: toEarn
            });
            newData.save().catch(err => {
                console.log(err);
                errors.databaseError(message);
            });
        }else{
            res.coins += toEarn;
            res.save().catch(err => {
                console.log(err);
                errors.databaseError(message);
            });
        }
        message.channel.send(jobEmbed);
    });
};

module.exports.config = {
    name: "work",
    usage: "rob",
    description: "Work on a random job to earn coins in the server.",
    aliases: [],
    noalias: "No alias",
    permission: [],
    enabled: true
};