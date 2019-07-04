const mongoDb = require("mongoose");

const messagesSchema = mongoDb.Schema({
    guildID: String,
    userID: String,
    points: Number
});

module.exports = mongoDb.model("messages", messagesSchema);