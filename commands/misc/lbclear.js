const Discord = require("discord.js");
const messagesSchema = require("../../utils/Schemas/messagesSchema");
const errors = require("../../utils/errors");
const robCoolDown = new Set();

module.exports.run = (bot, message, args, messageArray) => {

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


};

module.exports.config = {
    name: "lbclear",
    usage: "lbclear",
    description: "Clear the messages leaderboard.",
    aliases: ["lbreset"],
    permission: ["ADMINISTRATOR"],
    enabled: true
};