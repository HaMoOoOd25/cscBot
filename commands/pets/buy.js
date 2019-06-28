const Discord = require("discord.js");
const petSchema = require("../../utils/Schemas/PetSchema");
const errors = require("../../utils/errors");
const pets = require("../../pets");
const coinSchema = require("../../utils/Schemas/coinsSchema");

module.exports.run = (bot, message, args, messageArray) => {
    if (message.channel.id !== bot.settings.botCommandsChannel) return;

    //If command is incorrect
    if (args.length < 1) return errors.wrongCommandUsage(message, this.config.usage);

    //Random Pet Names
    const petNames = ["Hydro", "Oak", "Aspen", "Shasta", "Creep", "Gretel", "Gotti", "Tyrone", "Bart", "Yolo",
    "Strike", "Wicked", "Topaz", "Ashanti", "William"];
    //Get a random index for the names
    const randomPet = Math.floor(Math.random() * petNames.length);

    let price;
    let petToBuy;

    //Get the type of the wanted pet
    const petName = args[0];

    //If it's a common pet
    if (pets.common.includes(petName)){
        petToBuy = {
            name: petNames[randomPet],
            type: petName,
            level: 0,
            xp: 0,
            section: "common"
        };
        price = pets.commonPetPrice;
    }
    //If it's a rare pet
    else if (pets.rare.includes(petName)){
        petToBuy = {
            name: petNames[randomPet],
            type: petName,
            level: 0,
            xp: 0,
            section: "rare"
        };
        price = pets.rarePetPrice;
    }
    //If it's a legendary pet
    else if (pets.legendary.includes(petName)){
        petToBuy = {
            name: petNames[randomPet],
            type: petName,
            level: 0,
            xp: 0,
            section: "legendary"
        };
        price = pets.legendaryPetPrice;
    }
    //If pet not found
    else{
        return message.channel.send("We don't have that pet in here! :x:");
    }

    coinSchema.findOne({
        guildID: message.guild.id,
        userID: message.author.id
    }, (err, coinsRes) => {
        if (err){
            console.log(err);
            errors.databaseError(message);
        }

        //IF there is no enough coins or no coins at all
        if (!coinsRes || coinsRes.coins < price){
            const notEnoughCoins = new Discord.RichEmbed()
                .setAuthor(message.author.tag, message.author.avatarURL)
                .setColor("FF0000")
                .setDescription(`You need **${price - coinsRes.coins || price}** more coins to buy a **${petToBuy.type}** pet`);
            message.channel.send(notEnoughCoins);
        }else{
            petSchema.findOne({
                guildID: message.guild.id,
                userID: message.author.id,
                petType: petToBuy.type
            }, (err, res) => {
                if (err) {
                    console.log(err);
                    errors.databaseError(message);
                }

                //If the user already have that pet type
                if (res) {
                    const petFound = new Discord.RichEmbed()
                        .setAuthor(message.author.tag, message.author.avatarURL)
                        .setColor("FF0000")
                        .setDescription(`You already have a ${petToBuy.type} pet.`);
                    return message.channel.send(petFound);
                }else{
                    const newPet = new petSchema({
                        guildID: message.guild.id,
                        userID: message.author.id,
                        petName: petToBuy.name,
                        petType: petToBuy.type,
                        petSection: petToBuy.section,
                        petLevel: 0,
                        petXp: 0,
                        selected: false
                    });
                    newPet.save().catch(err => {
                        console.log(err);
                        errors.databaseError(message);
                    });

                    coinsRes.coins -= price;
                    coinsRes.save().catch(err => {
                        console.log(err);
                        errors.databaseError(message);
                    });

                    const PurchasedPet = new Discord.RichEmbed()
                        .setAuthor(message.author.tag, message.author.avatarURL)
                        .setColor(bot.settings.embedColor)
                        .setDescription(`You purchased a **${petToBuy.type}** pet for **${price}** coins.`);
                    message.channel.send(PurchasedPet)
                }
            })
        }
    })
};

module.exports.config = {
    name: "buy",
    usage: "buy ItemName",
    description: "Buy items from the shop.",
    aliases: [],
    noalais: "No alias",
    permission: [],
    enabled: true
};