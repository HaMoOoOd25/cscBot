const Discord = require("discord.js");

module.exports = (bot, member) => {

    //Get channel
    const welcomeChannel = member.guild.channels.get(bot.settings.mainChatChannel);
    const welcomeEmbed = new Discord.RichEmbed()
        .setAuthor(member.user.tag, member.user.avatarURL)
        .setColor(bot.settings.embedColor)
        .setThumbnail(member.guild.iconURL)
        .setDescription(`Welcome ${member} to ${member.guild.name}! Feel free to speak in <#530788544558661632> or ${welcomeChannel}.\n\n` +
        `You are the **${member.guild.members.filter(m => !m.user.bot).size}**th member`);
    welcomeChannel.send(welcomeEmbed);
};