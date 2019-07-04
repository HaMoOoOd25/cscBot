const Discord = require("discord.js");
const path = require("path");
const fs = require("fs");
const messagesSchema = require("../../utils/Schemas/messagesSchema");

module.exports.run = async (bot, message, args, messageArray) => {

    const housesJson = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../../configs/houses.json")).toString());
    const houses = housesJson.houses;

    const listEmbed = new Discord.RichEmbed()
        .setTitle("Top Houses")
        .setAuthor(message.author.tag, message.author.avatarURL)
        .setColor(bot.settings.embedColor);

    for (let i = 0; i < houses.length; i++){
        await messagesSchema.aggregate([
            {$match: {house: houses[i].name, guildID: message.guild.id}},
            {$group: {_id: null, points: {$sum: "$points"}}}
        ], (err, res) => {
            if (err) console.log(err);
            let role = message.guild.roles.find(r => r.name === houses[i].role);
            listEmbed.addField(`${houses[i].emoji} ${houses[i].name} [${role.members.size}]`, `${res[0] ? res[0].points : 0}`);
        })
    }
    message.channel.send(listEmbed);
};

module.exports.config = {
    name: "tophouses",
    usage: "tophouses",
    description: "View the top houses that has messages points.",
    aliases: ["tophouse", "houseslb", "lbhouses"],
    permission: [],
    enabled: true
};