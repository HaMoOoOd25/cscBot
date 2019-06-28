const errors = require("../utils/errors");
const messagesSchema = require("../utils/Schemas/messagesSchema");
const modMail = require("../utils/modMail");
const petSchema = require("../utils/Schemas/PetSchema");
const coinsSchema = require("../utils/Schemas/coinsSchema");

const messagesCoolDownSet = new Set();
const petXpCoolDownSet= new Set();

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

    //Message points (Every 1 minutes)
    if (!message.content.startsWith(bot.config.prefix)){
        if (messagesCoolDownSet.has(message.author.id)) return;

        messagesSchema.findOne({
            guildID: message.guild.id,
            userID: message.author.id
        }, (err, res) => {
            if (err) {
                errors.databaseError(message);
                console.log(err);
            }

            if (!res){
                const newData = new messagesSchema({
                    guildID: message.guild.id,
                    userID: message.author.id,
                    points: 1
                });
                newData.save().catch(err => {
                    errors.databaseError(message);
                    console.log(err);
                });
            }else{
                res.points += 1;

                if (res.points === 500) {
                    const toEarn = 1000;
                    coinsSchema.findOne({
                        guildID: message.guild.id,
                        userID: message.author.id
                    }, (err, res) => {
                        if (err) {
                            console.log(err);
                            errors.databaseError(message);
                        }

                        if (!res){
                            const newData = new coinsSchema({
                                guildID: message.guild.id,
                                userID: message.author.id,
                                coins: toEarn
                            });
                            newData.save().catch(err => {
                                console.log(err);
                                errors.databaseError(message);
                            });
                        }else {
                            res.coins += toEarn;
                            res.save().catch(err => {
                                console.log(err);
                                errors.databaseError(message);
                            });
                        }

                        message.channel.send(`${message.author}, you got 500 message points! Here is 1000 coins for you qt! Keep up the activity <3`);
                    })
                }
                res.save().catch(err => {
                    errors.databaseError(message);
                    console.log(err);
                });
            }
            messagesCoolDownSet.add(message.author.id);

            setTimeout(function () {
               messagesCoolDownSet.delete(message.author.id);
            }, 60000);
        })
    }

    //Pet xp system 15-25 xp every minute of chatting <3
    if (!message.content.startsWith(bot.config.prefix)){
        if (petXpCoolDownSet.has(message.author.id)) return;

        const XpDeterminer = 300;
        const maxLevel = 75;
        const xpMax = maxLevel * 300;
        const minXp = 15;
        const maxXp = 25 + 1;
        const xpToAdd = Math.floor(Math.random() * (maxXp - minXp) + minXp);

        petSchema.findOne({
            guildID: message.guild.id,
            userID: message.author.id,
            selected: true
        }, (err, res) => {
            if (err) {
                console.log(err);
                errors.databaseError(message);
            }

            if(res){
                const currentLvl = res.petLevel;
                const xpToLevelUp = currentLvl * XpDeterminer;

                //Check if user reached max xp <3
                if(res.petXp < xpMax){
                    res.petXp += xpToAdd;
                }else{
                    res.petXp = xpMax;
                }

                //Level Up User
                if (res.petXp >= xpToLevelUp && res.petLevel < maxLevel){
                    res.petLevel += 1;
                    message.channel.send(`${message.author}, ${res.petName}(${res.petType}) has reached level ${res.petLevel}!!`);
                }

                res.save().catch(err => {
                    console.log(err);
                    errors.databaseError(message);
                });
            }
        });
        petXpCoolDownSet.add(message.author.id);

        setTimeout(function () {
            petXpCoolDownSet.delete(message.author.id);
        }, 60000);
    }
};