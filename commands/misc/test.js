const Discord = require("discord.js");
const errors = require("../../utils/errors");
const fs = require("fs");
const path = require("path");
const settings = require("../../settings.json");

module.exports.run = async (bot, message, args, messageArray) => {
    location.reload();
    message.reply(`The id of the current welcome channel is: **${settings.welcomeChannel}**`);
};

module.exports.config = {
    name : "welcome",
    usage: "welcome #channel",
    description: "Change the channel where the welcome messages will be sent.",
    aliases: ["wlmessage"],
    permission: ["ADMINISTRATOR"],
    enabled: true
};