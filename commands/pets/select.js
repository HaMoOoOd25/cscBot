const Discord = require("discord.js");
const petSchema = require("../../utils/Schemas/PetSchema");
const errors = require("../../utils/errors");

module.exports.run = (bot, message, args, messageArray) => {
    if (message.channel.id !== bot.settings.botCommandsChannel) return;

    //select petName / pet type

    if (args.length < 1) return errors.wrongCommandUsage(message, this.config.usage);

    const petToFind = args.join(" ");
    const selectedEmbed = new Discord.RichEmbed()
        .setAuthor(message.author.tag, message.author.avatarURL)
        .setColor(bot.settings.embedColor)
        .setDescription(`You have selected **${petToFind}**`);


    petSchema.findOne({
        guildID: message.guild.id,
        userID: message.author.id,
        petType: petToFind
    }, (err, resWithType) => {
        if (err) return errors.databaseError(message, err);
        //Get the selected Pet
        petSchema.findOne({
            guildID: message.guild.id,
            userID: message.author.id,
            selected: true
        }, (err, res) => {
            if (err) return errors.databaseError(message, err);

            //If result not found with type try again with name </3
            if (!resWithType){
                petSchema.findOne({
                    guildID: message.guild.id,
                    userID: message.author.id,
                    petName: petToFind
                }, (err, resWithName) => {
                    if (err) return errors.databaseError(message, err);

                    //If no result found </3
                    if (!resWithName) {
                        const petNotFound = new Discord.RichEmbed()
                            .setAuthor(message.author.tag, message.author.avatarURL)
                            .setColor("FF0000")
                            .setDescription(`Pet not found.`);
                        return message.channel.send(petNotFound);
                    }else{
                        resWithName.selected = true;
                        resWithName.save().catch(err => {
                            console.log(err);
                            errors.databaseError(message);
                        });
                        if(res){
                            res.selected = false;
                            res.save().catch(err => errors.databaseError(message, err));
                        }
                        message.channel.send(selectedEmbed);
                    }
                });
            }else{
                resWithType.selected = true;
                resWithType.save().catch(err => errors.databaseError(message, err));
                if(res){
                    res.selected = false;
                    res.save().catch(err => errors.databaseError(message, err));
                }
                message.channel.send(selectedEmbed);
            }
        });
        });


};

module.exports.config = {
    name: "select",
    usage: "select pet name/type",
    description: "Select the pet that you want to do actions to it. (Naming, leveling up, view details)",
    aliases: ['pick'],
    permission: [],
    enabled: true
};