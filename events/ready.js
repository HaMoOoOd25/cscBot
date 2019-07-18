const mongoDb = require("mongoose");
const messagesSchema = require("../utils/Schemas/messagesSchema");
const drops = require("../utils/drops");
const Discord = require("discord.js");

module.exports = (bot) => {
    console.log(`${bot.user.username} is online`);

    const activities = [".help for commands", "and chilling", "and chatting", "#bot-spam to play", "Y'all qts", "Ilysm"];

    setInterval(() => {
        let status = activities[Math.floor(Math.random()*activities.length)];
        bot.user.setPresence({
            game: {name: status},
            status: 'online'
        });
    }, 10000);


    mongoDb.connect(bot.settings.mongoDb, {
        useNewUrlParser: true
    });

    const db = mongoDb.connection;

    db.on('error', function () {
        console.error.bind(console, 'connection error:')
    });

    db.once('open', function() {
        console.log("Database connected successfully");
    });



    // setInterval(function () {
    //
    //     const date = new Date();
    //     if (date.getDay() === 1 && date.getHours() === 24){
    //         messagesSchema.deleteMany({}, (err, res) => {
    //             if (err) {
    //                 console.log(err);
    //             }
    //         });
    //
    //     }
    // }, 3600000);


    setInterval(function () {
        drops.drop(bot);
    }, 7200000);

    setInterval(function () {
        drops.reactionDrop(bot)
    }, 1.44e+7)//1.44e+7
};