const Discord = require("discord.js");
const petSchema = require("../../utils/Schemas/PetSchema");
const errors = require("../../utils/errors");

module.exports.run = (bot, message, args, messageArray) => {
    if (message.channel.id !== bot.settings.botCommandsChannel) return;
    //namepet name

    //If incorrect command
    if (args < 1) return errors.wrongCommandUsage(this.config.usage);

    const petName = args.join(" ");

    petSchema.findOne({
        guildID: message.guild.id,
        userID: message.author.id,
        selected: true
    }, (err, res) => {
        if (err) {
            console.log(err);
            errors.databaseError(message);
        }

        //If no pet was found
        if (!res){
            const noSelectedPet = new Discord.RichEmbed()
                .setAuthor(message.author.tag, message.author.avatarURL)
                .setColor("FF0000")
                .setDescription("You don't have a selected pet.");
            message.channel.send(noSelectedPet);
        }else{
            res.petName = petName;
            res.save().catch(err => {
                console.log(err);
                errors.databaseError(message);
            });

            const namedEmbed = new Discord.RichEmbed()
                .setAuthor(message.author.tag, message.author.avatarURL)
                .setColor(bot.settings.embedColor)
                .setDescription(`Your **${res.petType}**'s name changed into **${petName}**`);
            message.channel.send(namedEmbed);
        }
    });
};

module.exports.config = {
    name: "namepet",
    usage: "namepet name",
    description: "Change the name of the selected pet.",
    aliases: ['petname', 'name'],
    permission: [],
    enabled: true
};