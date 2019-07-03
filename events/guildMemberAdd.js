const Discord = require("discord.js");

module.exports = (bot, member) => {

    //Get channel
    const welcomeChannel = member.guild.channels.get(bot.settings.welcomeChannel);
    const welcomeEmbed = new Discord.RichEmbed()
        .setAuthor(member.user.tag, member.user.avatarURL)
        .setColor(bot.settings.embedColor)
        .setThumbnail(member.guild.iconURL)
        .setDescription(`Welcome ${member} to ${member.guild.name}! Feel free to speak in ${welcomeChannel} or <#530788544558661632>.\n\n` +
        `You are the **${member.guild.memberCount}**th member`);
    welcomeChannel.send(welcomeEmbed);
};