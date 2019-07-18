const Discord = require("discord.js");
const coinsSchema = require("../../utils/Schemas/coinsSchema");
const bankSchema = require("../../utils/Schemas/bankSchema");
const errors = require("../../utils/errors");

module.exports.run = (bot, message, args, messageArray) => {
    if (message.channel.id !== bot.settings.botCommandsChannel) return;

    const member = message.mentions.members.first() || message.mentions.users.first() || message.member;

    let balance = 0;
    let bank = 0;

    coinsSchema.findOne({
        guildID: message.guild.id,
        userID: member.user.id
    }, (err, res) => {
        if (err) {
            errors.databaseError(message);
            return console.log(err);
        }

        if (!res || res.coins === 0){
            balance = 0;
        }else{
            balance = res.coins;
        }

        bankSchema.findOne({
            guildID: message.guild.id,
            userID: member.user.id
        }, (err, res) => {
            if (err) {
                errors.databaseError(message);
                console.log(err);
            }

            if (!res || res.coins === 0){
                bank = 0;
            }else{
                bank = res.coins;
            }

            const balanceEmbed = new Discord.RichEmbed()
                .setAuthor(message.author.tag, message.author.avatarURL)
                .setTitle(`${member.user.username}'s balance`)
                .setColor(bot.settings.embedColor)
                .setDescription(`💰 **Wallet:** \`${balance}\` \n🏦 **Bank:** \`${bank}\``);
            message.channel.send(balanceEmbed);
        });
    });




};

module.exports.config = {
    name: "balance",
    usage: "balance @someone",
    description: "Get yours or someone's balance by mentioning them.",
    aliases: ["bal", "coins", "coin"],
    permission: [],
    enabled: true
};