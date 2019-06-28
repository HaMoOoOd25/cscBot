const Discord = require("discord.js");
const petSchema = require("../../utils/Schemas/PetSchema");
const errors = require("../../utils/errors");
const pets = require("../../pets");

module.exports.run = (bot, message, args, messageArray) => {
    if (message.channel.id !== bot.settings.botCommandsChannel) return;

    //select petName / pet type

    if (args.length < 1) return errors.wrongCommandUsage(message, this.config.usage);

    const petToFind = args.join(" ");
    const selectedEmbed = new Discord.RichEmbed()
        .setAuthor(message.author.tag, message.author.avatarURL)
        .setColor(bot.settings.embedColor)
        .setDescription(`You have selected **${petToFind}**`);

    let pet;

    petSchema.findOne({
        guildID: message.guild.id,
        userID: message.author.id,
        petType: petToFind
    }, (err, resWithType) => {
        if (err){
            console.log(err);
            errors.databaseError(message);
        }
        //Get the selected Pet
        petSchema.findOne({
            guildID: message.guild.id,
            userID: message.author.id,
            selected: true
        }, (err, res) => {
            if (err){
                console.log(err);
                errors.databaseError(message);
            }

            //If result not found with type try again with name </3
            if (!resWithType){
                petSchema.findOne({
                    guildID: message.guild.id,
                    userID: message.author.id,
                    petName: petToFind
                }, (err, resWithName) => {
                    if (err){
                        console.log(err);
                        errors.databaseError(message);
                    }

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
                            res.save().catch(err => {
                                console.log(err);
                                errors.databaseError(message);
                            });
                        }
                        message.channel.send(selectedEmbed);
                    }
                });
            }else{
                resWithType.selected = true;
                resWithType.save().catch(err => {
                    console.log(err);
                    errors.databaseError(message);
                });
                if(res){
                    res.selected = false;
                    res.save().catch(err => {
                        console.log(err);
                        errors.databaseError(message);
                    });
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