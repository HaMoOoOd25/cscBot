const Discord = require("discord.js");
const fs = require("fs");
const path = require("path");

const errors = require("./errors");

const petSchema = require("./Schemas/PetSchema");
const coinsSchema = require("./Schemas/coinsSchema");
const messagesSchema = require("./Schemas/messagesSchema");

const messagesCoolDownSet = new Set();
const petXpCoolDownSet= new Set();
//-------------------------------

module.exports.messagePoints = (bot, message) => {
    if (messagesCoolDownSet.has(message.author.id)) return;

    const housesJson = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../configs/houses.json")).toString());
    const houses = housesJson.houses;

    let memberHouse = "none";

    for (let i = 0; i < houses.length; i++){
        const HouseRole = message.member.roles.find(r => r.name === houses[i].role);
        if (HouseRole) {
            memberHouse = houses[i].name;
        }
    }

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
                points: 1,
                house: memberHouse
            });
            newData.save().catch(err => {
                errors.databaseError(message);
                console.log(err);
            });
        }else{
            res.points += 1;
            res.house = memberHouse;

            if (res.points > 499 && res.points % 500 === 0) {
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

                    const embed = new Discord.RichEmbed()
                        .setAuthor(message.author.tag, message.author.avatarURL)
                        .setColor(bot.settings.embedColor)
                        .setDescription(`${message.author} just earned 1000 coins for gaining 500 points.`);
                    message.channel.send(embed);
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
    });
};

module.exports.petPoints = (bot, message) => {
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
};