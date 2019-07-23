const Discord = require("discord.js");
const path = require("path");
const fs = require("fs");
const db = require("quick.db");
const ms = require("parse-ms");

module.exports.run = async (bot, message, args, messageArray) => {
    if (message.channel.id !== bot.settings.botCommandsChannel) return;

    const housesJson = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../../configs/houses.json")).toString());

    const houses = housesJson.houses;

    //Add the available houses to field
    for (let i = 0; i < houses.length; i++){
        let memberHouse = message.member.roles.find(r => r.name === houses[i].role);

        if (memberHouse){
            message.member.removeRole(memberHouse).then(role => {
                const leftHouseEmbed = new Discord.RichEmbed()
                    .setAuthor(message.author.tag, message.author.avatarURL)
                    .setColor(bot.settings.embedColor)
                    .setDescription(`You have left the house of **${houses[i].name}**.`);
                message.channel.send(leftHouseEmbed);
            });
            return;
        }
        else if (i === houses.length - 1){
            const noHouse = new Discord.RichEmbed()
                .setAuthor(message.author.tag, message.author.avatarURL)
                .setColor("#FF0000")
                .setDescription(`You are not in a house to leave.`);
            message.channel.send(noHouse);
        }
    }
};

module.exports.config = {
    name: "leavehouse",
    usage: "leavehouse",
    description: "Leave the house that you are currently in.",
    aliases: ["lh"],
    permission: [],
    enabled: true
};