const botconfig = require("./botconfig.json");
const settings = require("./settings.json");

const Discord = require("discord.js");
const fs = require("fs");
const Enmap = require("enmap");

const bot = new Discord.Client({
    disableEveryone: true
});

bot.settings = settings;
bot.config = botconfig;
bot.commands = new Enmap();
bot.aliases = new Enmap();

//Event Handler
fs.readdir("./events/", (err, files) => {
    if (err) return console.error(err);
    files.forEach(file => {
        if (!file.endsWith(".js")) return;
        const event = require(`./events/${file}`);
        let eventName = file.split(".")[0];
        bot.on(eventName, event.bind(null, bot));
        delete require.cache[require.resolve(`./events/${file}`)];
    });
});

//command handler
const commands = ["economy", "messages", "misc", "moderation", "pets", "houses"];
for (let i = 0; i < commands.length; i++){
    fs.readdir(`./commands/${commands[i]}/`, (err, files) => {
        if (err) return console.error(err);
        files.forEach(file => {
            if (!file.endsWith(".js")) return;
            let props = require(`./commands/${commands[i]}/${file}`);
            let commandName = file.split(".")[0];
            console.log(`Attempting to load command ${commandName}`);
            bot.commands.set(commandName ,props);
            //Setting Up aliases (Must Have Aliases)
            props.config.aliases.forEach(alias => {
                bot.aliases.set(alias, props.config.name)
            })
        });
    });
}

bot.login(botconfig.token);