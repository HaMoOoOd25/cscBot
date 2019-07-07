const Discord = require("discord.js");

const messagesSchema = require("../../utils/Schemas/messagesSchema");
const housepointsSchema = require("../../utils/Schemas/housesPointsSchema");
const coinsSchema = require("../../utils/Schemas/coinsSchema");

const errors = require("../../utils/errors");

const fs = require("fs");
const { resolve } = require("path");

//------

module.exports.run = async (bot, message, args, messageArray) => {
    clearMessageLeaderboard(message, bot);
    clearHouses(message, bot);
};

function clearMessageLeaderboard(message, bot) {

    //First: We filter and get the first member.
    messagesSchema.find({
    }).sort([
        ['points', 'descending']
    ]).exec(async (err, res) => {
        if (err) {
            errors.databaseError(message);
            console.log(err);
        }

        if (res){
            if (!res[0]) {
                try {
                    await message.guild.owner.user.send(`${message.guild.owner}, leaderboard reset but no winner was identified.`);
                }catch {}
                return
            }

            const winner = message.guild.members.get(res[0].userID);

            //We clear the list
            messagesSchema.deleteMany({}, (err, res) => {
                if (err) {
                    console.log(err);
                    errors.databaseError(message);
                }
            });

            if (winner) {
                const ResetedEmbed = new Discord.RichEmbed()
                    .setColor(bot.settings.embedColor)
                    .setDescription(`Leaderboard Reseted! Winner is ${winner} 🎉`)
                    .setAuthor(bot.user.username, bot.user.avatarURL);
                try {
                    await message.guild.owner.user.send(ResetedEmbed);
                    await message.guild.owner.user.send(`${message.guild.owner}`);
                }catch {}
            }else{
                const noWinner = new Discord.RichEmbed()
                    .setColor(bot.settings.embedColor)
                    .setDescription(`Leaderboard Reseted! Couldn't identify a winner.`)
                    .setAuthor(bot.user.username, bot.user.avatarURL);
                try {
                    await message.guild.owner.user.send(noWinner);
                    await message.guild.owner.user.send(`${message.guild.owner}`);
                }catch {}
            }

        }
    });
}

function clearHouses(message, bot) {
    //Clearing House Leaderboard
    let winnerHouse;
    let winnerRole;

    const toEarn = 5000;

    //First: We sort the list and get the first house.
    housepointsSchema.find({
    }).sort([
        ['points', 'descending']
    ]).exec(async (err, res) => {
        if (err) {
            errors.databaseError(message);
            console.log(err);
        }

        winnerHouse = res[0].house || "None";

        //We clear the list.
        housepointsSchema.deleteMany({}, (err, res) => {
            if (err) {
                console.log(err);
                errors.databaseError(message);
            }
        });

        //If there is no winner
        if (winnerHouse === "None"){
            return message.reply(" no winner was identified.");
        }else{

            //Second: We get the role of the winner house.
            const housesJson = JSON.parse(fs.readFileSync(resolve(__dirname, "../../configs/houses.json")).toString());
            const houses = housesJson.houses;

            for (let i = 0; i < houses.length; i++){
                if (winnerHouse === houses[i].name){
                    winnerRole = message.guild.roles.find(r => r.name === houses[i].role);
                }
            }


            //Third: if the role exists, we give each member of that role 5k coins
            if (winnerRole){
                winnerRole.members.forEach(member => {

                    coinsSchema.findOne({
                        guildID: message.guild.id,
                        userID: member.user.id
                    }, (err, res) => {
                        if (err) {
                            console.log(err);
                            errors.databaseError(message);
                        }

                        if(!res){
                            const newData = coinsSchema({
                                guildID: message.guild.id,
                                userID: member.user.id,
                                coins: toEarn
                            });
                            newData.save().catch(err => console.log(err));
                        }else{
                            res.coins += toEarn;
                            res.save().catch(err => console.log(err));
                        }
                    });
                });

                //4th: We announce it
                const embed = new Discord.RichEmbed()
                    .setAuthor(message.author.tag, message.author.avatarURL)
                    .setColor(bot.settings.embedColor)
                    .setDescription(`House of ${winnerHouse} won. Every member was given ${toEarn} coins.`)
                message.channel.send(embed);
            }else{
                message.reply("Failed to identify the role of the winner house.");
            }
        }
    });
}

module.exports.config = {
    name: "lbclear",
    usage: "lbclear",
    description: "Clear the messages and houses leaderboard.",
    aliases: ["lbreset"],
    permission: ["ADMINISTRATOR"],
    enabled: true
};