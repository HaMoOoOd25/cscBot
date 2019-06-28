const Discord = require("discord.js");
const errors = require("../../utils/errors");

module.exports.run = async (bot, message, args, messageArray) => {

    //!report @user this is reason
    let rUser = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]));
    let reason = args.slice(1).join(" ") || "None";
    let prefix = bot.config.prefix;

    //Check command usage
    if (messageArray.length < 2) return errors.wrongCommandUsage(message, "report @someone reason");

    //Checking user
    if (!rUser) return message.reply("I can't see that user.");


    //Check user type (if bot, don't allow)
    if (rUser.user.bot) return message.channel.send("You can't report my friends!");

	//Deleting Report
	message.delete();
	
    //Sending report
    const report = [];

    report.push(`👤 **Reporter:** ${message.author}\n`);
    report.push(`⛓ **Reported:** ${rUser}\n`);
    report.push(`💳 **ID:** ${rUser.id}\n`);
    report.push(`📋 **Reason:** ${reason}\n`);
    report.push(`🗨**Channel:** ${message.channel}`);

    const reportlog = message.guild.channels.get(bot.settings.reportChannel);

    let reportembed = new Discord.RichEmbed()
        .setColor("#FF0000")
        .setTitle("Report")
        .setDescription(report)
        .setThumbnail(rUser.avatarURL)
        .setTimestamp(message.createdAt)
        .setFooter(message.author.username, message.author.avatarURL);
    if (reportlog) reportlog.send(reportembed);

    //Notify
    try {
        await message.author.send("Your report has been submitted. Our staff members will view when they can. Thank you!");
    } catch (err) {

    }

};

module.exports.config = {
    name: "report",
    usage: "report @someone",
    description: "Report a member in the server to the staff.",
    aliases: [],
    noalias: "No alias",
    permission: [],
    enabled: true
};