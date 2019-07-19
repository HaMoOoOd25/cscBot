const Discord = require("discord.js");
const petSchema = require("../../utils/Schemas/PetSchema");
const errors = require("../../utils/errors");

module.exports.run = (bot, message, args, messageArray) => {
    if (message.channel.id !== bot.settings.botCommandsChannel) return;

    petSchema.findOne({
        guildID: message.guild.id,
        userID: message.author.id,
        selected: true
    }, (err, res) => {
        if (err) return errors.databaseError(message, err)

        //If there is no pets
        if (!res) {
            const noPets = new Discord.RichEmbed()
                .setAuthor(message.author.tag, message.author.avatarURL)
                .setColor("FF0000")
                .setDescription(`You don't have a selected pet.`);
            message.channel.send(noPets);
        }else{

            //Setup the list
            const details = [];
            details.push(`**▻Name:** ${res.petName}`);
            details.push(`**▻Type:** ${res.petType}`);
            details.push(`**▻Section:** ${res.petSection}`);
            details.push(`**▻Level:** ${res.petLevel}`);
            details.push(`**▻Xp:** ${res.petXp}`);

            const listEmbed = new Discord.RichEmbed()
                .setAuthor(message.author.tag, message.author.avatarURL)
                .setColor(bot.settings.embedColor)
                .setTitle("Pet info")
                .setDescription(details);
            message.channel.send(listEmbed);
        }
    });

};

module.exports.config = {
    name: "petlist",
    usage: "list",
    description: "List the pets that you own.",
    aliases: ['mypet'],
    permission: [],
    enabled: true
};