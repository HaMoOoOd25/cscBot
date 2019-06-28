const mongoDb = require("mongoose");

const messagesSchema = mongoDb.Schema({
    guildID: String,
    userID: String,
    coins: Number
});

module.exports = mongoDb.model("coins", messagesSchema);