const mongoDb = require("mongoose");

const housesPoints = mongoDb.Schema({
    guildID: String,
    house: String,
    points: Number
});

module.exports = mongoDb.model("housesPoints", housesPoints);