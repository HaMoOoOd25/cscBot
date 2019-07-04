const Discord = require("discord.js");
const pets = require("../../configs/pets");

module.exports.run = (bot, message, args, messageArray) => {
    if (message.channel.id !== bot.settings.botCommandsChannel) return;

    //Making the lists and numbering them
    const commonPets = [];
    for (let i = 0; i < pets.common.length; i++){
        commonPets.push(`${i + 1}. ${pets.common[i]}\n`)
    }
    const rarePets = [];
    for (let i = 0; i < pets.rare.length; i++){
        rarePets.push(`${i + 1}. ${pets.rare[i]}\n`)
    }
    const legendaryPets = [];
    for (let i = 0; i < pets.legendary.length; i++){
        legendaryPets.push(`${i + 1}. ${pets.legendary[i]}\n`)
    }

    //Setting up the pages
    const shop = [];
    const shop2 = [];
    const shop3 = [];

    let pages = [shop, shop2, shop3];
    let page = args[0] || 1;

    //Adding lists to the pages
    shop.push(`**__Common Pets__**\n\n`);
    shop.push(commonPets.join(" "));
    shop.push(`\n **__Price for each__**: ${pets.commonPetPrice} coins`);

    shop2.push(`**__Rare Pets__**\n\n`);
    shop2.push(rarePets.join(" "));
    shop2.push(`\n **__Price for each__**: ${pets.rarePetPrice} coins`);

    shop3.push(`**__Legendary Pets__**\n\n`);
    shop3.push(legendaryPets.join(" "));
    shop3.push(`\n **__Price for each__**: ${pets.legendaryPetPrice} coins`);

    //Showing the page <3
    const shopEmbed = new Discord.RichEmbed()
        .setAuthor(message.author.tag, message.author.avatarURL)
        .setColor(bot.settings.embedColor)
        .setFooter(`Page ${page} of ${pages.length}`)
        .setDescription([pages[page-1].join(" ")] || pages[0]);
    message.channel.send(shopEmbed);
};

module.exports.config = {
    name: "shop",
    usage: "shop",
    description: "View the pets that you can buy.",
    aliases: [],
    noalais: "No alias",
    permission: [],
    enabled: true
};