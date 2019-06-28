const mongoDb = require("mongoose");

const pets = mongoDb.Schema({
    guildID: String,
    userID: String,
    petName: String,
    petType: String,
    petSection: String,
    petLevel: Number,
    petXp: Number,
    selected: Boolean
});

module.exports = mongoDb.model("membersPets", pets);