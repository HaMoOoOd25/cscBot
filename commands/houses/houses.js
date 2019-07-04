const Discord = require("discord.js");
const path = require("path");
const fs = require("fs");
const db = require("quick.db");
const ms = require("parse-ms");

module.exports.run = async (bot, message, args, messageArray) => {
    if (message.channel.id !== bot.settings.botCommandsChannel) return;

    const housesJson = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../../configs/houses.json")).toString());

    const houses = housesJson.houses;

    //create the list embed
    const houseslistEmbed = new Discord.RichEmbed()
        .setAuthor(message.author.tag, message.author.avatarURL)
        .setColor(bot.settings.embedColor)
        .setDescription(`React to select a house. **Be careful because you can only select once per week!**`)
        .setFooter(`You have 1 minute to select.`);

    //Add the available houses to field
    for (let i = 0; i < houses.length; i++){
        let role = message.guild.roles.find(r => r.name === houses[i].role);
        houseslistEmbed.addField(`${houses[i].emoji} ${houses[i].name} [${role.members.size}]`, `${houses[i].description}`);
    }

    //Cooldown
    const cooldown = 6.048e+8;
    let lastDaily = await db.fetch(`lastHouseSelect_${message.author.id}`);

    //If the user already selected a house in the paste week
    if(lastDaily !== null && cooldown - (Date.now() - lastDaily) > 0){
        let timeObj = ms(cooldown - (Date.now() - lastDaily));
        houseslistEmbed.setDescription(`You have to wait **${timeObj.days}d ${timeObj.hours}h ${timeObj.minutes}m ${timeObj.seconds}s** to select a house again.`);
        houseslistEmbed.setColor("FF0000");
        houseslistEmbed.setFooter("You can't select yet.");
        return message.channel.send(houseslistEmbed);
    }

    //send message and start reaction collector
    message.channel.send(houseslistEmbed).then(async msg => {
        for (let i = 0; i < houses.length; i++){
            await msg.react(houses[i].emoji)
        }

        console.log("1");
        // Create a reaction collector
        const filter = (reaction, user) => user.id === message.author.id;
        const collector = msg.createReactionCollector(filter, {
            max : 1,
            time: 60000
        });
        collector.on('collect', async r => {
            const selectedHouse = r.emoji;
            for (let i = 0; i < houses.length; i++){
                await message.member.removeRole(message.guild.roles.find(r => r.name === houses[i].role).id);
                if (selectedHouse.name === houses[i].emoji){
                    await message.member.addRole(message.guild.roles.find(r => r.name === houses[i].role).id);
                    message.reply(` you have selected house of **${houses[i].name}**`);
                    db.set(`lastHouseSelect_${message.author.id}`, Date.now());
                }
            }
        });
    });
};

module.exports.config = {
    name: "houses",
    usage: "houses",
    description: "View and select the house you want to join.",
    aliases: [],
    noalais: "No alias",
    permission: [],
    enabled: true
};