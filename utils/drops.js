const Discord = require("discord.js");
const coinsSchema = require("./Schemas/coinsSchema");
const errors = require("./errors");

module.exports.drop = (bot) => {

    const guild = bot.guilds.get(bot.settings.guildID);
    const channel = guild.channels.get(bot.settings.mainChatChannel);

    const randomWords = ["calm","mouse","blank","end","conventional","tile","disgrace","avant-garde",
        "alive","attic","program","strategic","dinner","prevent","happen","calorie","recruit","rabbit","frame","negligence",
        "bulb","transport","bishop","shake","introduce","purpose","sweet","emphasis","try","lunch","colon","article",
        "telephone","reach","displace","hypnothize","twin","chauvinist","pleasant","imposter","exclusive","traffic","ancestor",
        "grow","posture","spill","gun","grass","spell","evolution"];

    const min = Math.ceil(250);
    const max = Math.floor(600 + 1);
    const prize = Math.floor(Math.random() * (max - min) + min);

    let random = Math.floor(Math.random() * randomWords.length);

    const dropEmbed = new Discord.RichEmbed()
        .setAuthor(bot.user.username, bot.user.avatarURL)
        .setTitle("New Drop")
        .setColor(bot.settings.embedColor)
        .setDescription(`First one to type **${randomWords[random]}** gains **${prize}** coins!`)
    channel.send(dropEmbed).then(async msg => {

        const filter = m => m.author !== m.author.bot;

        const messageCollector = channel.createMessageCollector(filter, {})

        messageCollector.on('collect', collectedMsg => {
            if (collectedMsg.content.toLowerCase() === randomWords[random]){
                messageCollector.stop();
                const claimedEmbed = new Discord.RichEmbed()
                    .setDescription(`${collectedMsg.author} has claimed the ${prize} coins!`)
                    .setColor(bot.settings.embedColor);
                channel.send(claimedEmbed);

                coinsSchema.findOne({
                    guildID: guild.id,
                    userID: collectedMsg.author.id
                }, (err, res) => {
                    if (err) return errors.databaseError(message, err);

                    if (!res){
                        const newData = coinsSchema({
                            guildID: guild.id,
                            userID: collectedMsg.author.id,
                            coins: prize
                        });
                        newData.save().catch(err => errors.databaseError(message, err));
                    }else{
                        res.coins += prize;
                        res.save().catch(err => errors.databaseError(message, err));
                    }
                })
            }
        });
    });
};

module.exports.reactionDrop = (bot) => {

    const guild = bot.guilds.get(bot.settings.guildID);
    const channel = guild.channels.get(bot.settings.mainChatChannel);
    const prize = 1000;

    const embed = new Discord.RichEmbed()
        .setAuthor(bot.user.username, bot.user.avatarURL)
        .setColor(bot.settings.embedColor)
        .setTitle("Reaction Drops")
        .setDescription(`React with ✅ to join.\n **Prize:** \`${prize}\``)
        .setFooter('60 seconds to join.');
    channel.send(embed).then(async msg => {

        await msg.react('✅');
        const filter = (r, u) => r.emoji.name === '✅' && u !== u.bot;
        msg.awaitReactions(filter, {
            time: 60000
        }).then(collected => {

            if (collected.first()) {
                const joinedUsers = collected.first().users.filter(user => !user.bot);
                if (joinedUsers.size >= 1){
                    const winnerUser = joinedUsers.random();
                    coinsSchema.findOne({
                        guildID: guild.id,
                        userID: winnerUser.id
                    }, (err, res) => {
                        if (err) return errors.databaseError(message, err);

                        if (!res){
                            const newData = coinsSchema({
                                guildID: guild.id,
                                userID: winnerUser.id,
                                coins: prize
                            });
                            newData.save().catch(err => errors.databaseError(message, err));
                        }else{
                            res.coins += prize;
                            res.save().catch(err => errors.databaseError(message, err));
                        }

                        msg.channel.send(`${winnerUser} has won the ${prize} coins!`);
                    })
                }else{
                    const noWinnerEmbed = new Discord.RichEmbed()
                        .setAuthor(bot.user.username, bot.user.avatarURL)
                        .setColor(bot.settings.embedColor)
                        .setTitle("Reaction Drops")
                        .setDescription(`No winner has been selected.`);
                    channel.send(noWinnerEmbed);
                }
            }
        })
    });
};