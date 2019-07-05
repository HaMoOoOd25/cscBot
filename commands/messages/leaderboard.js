const Discord = require("discord.js");
const messageSchema = require("../../utils/Schemas/messagesSchema");
const errors = require("../../utils/errors");

module.exports.run = (bot, message, args, messageArray) => {

    const emojis = ['🥇', '🥈', '🥉', '🔹', '🔹', '🔹', '🔸', '🔸', '🔸', '🔸'];

    messageSchema.find({
    }).sort([
        ['points', 'descending']
    ]).exec((err, res) => {
        if (err) {
            errors.databaseError(message);
            console.log(err);
        }
        let leaderboardEmbed = new Discord.RichEmbed()
            .setTitle("Messages Leaderboard");

        if (res.length === 0){
            leaderboardEmbed.setColor('#FF0000');
            leaderboardEmbed.setDescription('No results were found!')
        } else if (res.length < 10){
            const leaderboard = [];
            for(i = 0; i < res.length; i++){
                let member = message.guild.members.get(res[i].userID) || 'User Left';
                if (member === "User Left"){
                    leaderboard.push(`\\${emojis[i]} **${member} | Message Points:** ${res[i].points}\n`);
                }else{
                    leaderboard.push(`\\${emojis[i]} **${member.user.username} | Message Points:** ${res[i].points}\n`);
                }
            }
            leaderboardEmbed.setColor(bot.settings.embedColor);
            leaderboardEmbed.setDescription(leaderboard);
        }else{
            leaderboardEmbed.setColor(bot.settings.embedColor);
            const leaderboard = [];
            for(i = 0; i < 10; i++){
                let member = message.guild.members.get(res[i].userID) || 'User Left';
                if (member === "User Left"){
                    leaderboard.push(`\\${emojis[i]} **${member} | Message Points:** ${res[i].points}\n`);
                }else{
                    leaderboard.push(`\\${emojis[i]} **${member.user.username} | Message Points:** ${res[i].points}\n`);
                }
            }
            leaderboardEmbed.setDescription(leaderboard);
        }
        message.channel.send(leaderboardEmbed);
    });
};

module.exports.config = {
    name: "leaderboard",
    usage: "leaderboard",
    description: "Get current week's top messages leaderboard.",
    aliases: ["lb"],
    permission: [],
    enabled: true
};