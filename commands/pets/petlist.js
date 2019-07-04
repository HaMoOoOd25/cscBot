const Discord = require("discord.js");
const petSchema = require("../../utils/Schemas/PetSchema");
const errors = require("../../utils/errors");

module.exports.run = (bot, message, args, messageArray) => {
    if (message.channel.id !== bot.settings.botCommandsChannel) return;

    petSchema.find({
        guildID: message.guild.id,
        userID: message.author.id
    }, (err, res) => {
        if (err) {
            console.log(err);
            errors.databaseError(message);
        }

        //If there is no pets
        if (!res) {
            const noPets = new Discord.RichEmbed()
                .setAuthor(message.author.tag, message.author.avatarURL)
                .setColor("FF0000")
                .setDescription(`You don't have any pet.`);
            message.channel.send(noPets);
        }else{
            //const list = [];
            const listEmbed = new Discord.RichEmbed()
                .setAuthor(message.author.tag, message.author.avatarURL)
                .setFooter(`You have ${res.length} pets.`)
                .setColor(bot.settings.embedColor);

            //list.push(`**__You have ${res.length} pets__**\n`);

            for (let i = 0; i < res.length; i++) {
               // list.push(`${i + 1}. ${res[i].pet.name} | ${res[i].pet.type} | ${res[i].pet.level}`);
                listEmbed.addField(res[i].petName, `**Type:** ${res[i].petType}\n**Level:** ${res[i].petLevel}`);
            }
            message.channel.send(listEmbed);
        }
    });

};

module.exports.config = {
    name: "petlist",
    usage: "list",
    description: "List the pets that you own.",
    aliases: ['pets'],
    permission: [],
    enabled: true
};