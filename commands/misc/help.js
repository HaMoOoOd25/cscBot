const Discord = require("discord.js");

module.exports.run = (bot, message, args, messageArray) => {
    if (message.channel.id !== bot.settings.botCommandsChannel) return;

    if (args[0] === "help") return message.channel.send(`Just do ${bot.config.prefix}help`);

    if (args[0]) {
        let command = args[0];
        if (bot.commands.has(command)){
            command = bot.commands.get(command);
            if (!message.member.hasPermission(command.config.permission)){
                const noPermission = new Discord.RichEmbed()
                    .setAuthor(message.author.tag, message.author.avatarURL)
                    .setColor("#FF0000")
                    .setDescription("You don't have permission to view info about this command.");
                message.channel.send(noPermission);
            }else{
                const help = [];
                help.push(`**Bot prefix:** ${bot.config.prefix}`);
                help.push(`**▻Command:** ${command.config.name}`);
                help.push(`**▻Description:** ${command.config.description || "No Description"}`);
                help.push(`**▻Usage:** ${command.config.usage || "No Usage"}`);
                help.push(`**▻Aliases:** ${command.config.noalias || command.config.aliases}`);
                let HelpEmbed = new Discord.RichEmbed()
                    .setColor(bot.settings.embedColor)
                    .setAuthor("Commands Help", message.author.avatarURL)
                    .setThumbnail(bot.user.avatarURL)
                    .setDescription(help);
                message.channel.send(HelpEmbed);
            }
        }
    }

    if (!args[0]) {
        let commands = [...bot.commands.values()];
        let script = "";
        commands.forEach(command => {
            script += " ``" + command.config.name + "`` ";
        });
        const helpEmbed = new Discord.RichEmbed()
            .setAuthor("Commands Help", message.author.avatarURL)
            .setThumbnail(bot.user.avatarURL)
            .setColor(bot.settings.embedColor)
            .setDescription(`Commands available for ${bot.user.username}.\n Bot prefix is **${bot.config.prefix}**`)
            .addField("Commands:", script)
            .setFooter(`Type ${bot.config.prefix}help command to get more info about a command`);
        message.channel.send(helpEmbed);
    }
};

module.exports.config = {
    name : "help",
    usage: "help command",
    description: "Get information about a command.",
    aliases: ["commands"],
    permission: [],
    enabled: true
};