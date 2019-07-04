const Discord = require("discord.js");
const path = require("path");
const fs = require("fs");
const housesPointsSchema = require("../../utils/Schemas/housesPointsSchema");

module.exports.run = async (bot, message, args, messageArray) => {

    const housesJson = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../../configs/houses.json")).toString());
    const houses = housesJson.houses;

    housesPointsSchema.find({
    }).sort([
        ['points', 'descending']
    ]).exec(async (err, res) => {
        if (err) {
            errors.databaseError(message);
            console.log(err);
        }
        let leaderboardEmbed = new Discord.RichEmbed()
            .setTitle("Houses Leaderboard")
            .setColor(bot.settings.embedColor);
        const lb = [];
        for (let i = 0; i < res.length; i++){
            for (let h = 0; h < houses.length; h++){
                if (res[i].house === houses[h].name){

                    let role = message.guild.roles.find(r => r.name === houses[h].role);
                   leaderboardEmbed.addField(`${houses[h].emoji} ${houses[h].role} [${role.members.size}]`, `${res[i].points}`);
                }
            }
        }
        message.channel.send(leaderboardEmbed);
    });
};

module.exports.config = {
    name: "tophouses",
    usage: "tophouses",
    description: "View the top houses that has messages points.",
    aliases: ["tophouse", "houseslb", "lbhouses"],
    permission: [],
    enabled: true
};