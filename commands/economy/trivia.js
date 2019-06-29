const Discord = require("discord.js");
const coinsSchema = require("../../utils/Schemas/coinsSchema");
const db = require("quick.db");
const errors = require("../../utils/errors");
const ms = require("parse-ms");
const superagent = require("superagent");
const decoder = require("unescape");

module.exports.run = async (bot, message, args, messageArray) => {

    //Run only in bot commands
    if (message.channel.id !== bot.settings.botCommandsChannel) return;

    //Cooldown
    const cooldown = 2.16e+7;
    let lastDaily = await db.fetch(`lastTrivia_${message.author.id}`);
    if(lastDaily !== null && cooldown - (Date.now() - lastDaily) > 0){
        let timeObj = ms(cooldown - (Date.now() - lastDaily));
        const coolDownEmbed = new Discord.RichEmbed()
            .setAuthor(message.author.tag, message.author.avatarURL)
            .setColor("FF0000")
            .setDescription(`You have to wait **${timeObj.hours}h ${timeObj.minutes}m ${timeObj.seconds}s** before playing trivia again`);
        return message.channel.send(coolDownEmbed);
    }
    db.set(`lastTrivia_${message.author.id}`, Date.now());

    //Define the variables for the question details
    let question;
    let category;
    let type;
    let difficulty;
    let correctAnswer;
    let incorrectAnswers;
    let answerChoices;

    //The earning range 250-1000


    //Get the question from the API
    let {body} = await superagent
        .get(`https://opentdb.com/api.php?amount=1`);
    //Map the results
    body.results.map(loadedQuestion => {
        //Assign the question details to variables
        console.log(loadedQuestion);
        question = decoder(loadedQuestion.question);
        category = loadedQuestion.category;
        type = loadedQuestion.type;
        difficulty = loadedQuestion.difficulty;

        correctAnswer = loadedQuestion.correct_answer;
        incorrectAnswers = loadedQuestion.incorrect_answers;

        //Inputing the correct answer into the wrong answers randomly
        answerChoices = [...loadedQuestion.incorrect_answers];
        const answer = Math.floor(Math.random() * 3) + 1;
        answerChoices.splice(answer -1, 0, loadedQuestion.correct_answer);
    });

    //Adding choices letters
    const letters = ["A", "B", "C", "D"];
    const choicesPreview = [];

    //Decide the correct letter for the answer
    let correctLetter;

    for (let i = 0; i < answerChoices.length; i++) {
        choicesPreview.push(`**${letters[i]}.** ${decoder(answerChoices[i])}`);
        if (answerChoices[i] === correctAnswer){
            correctLetter = letters[i];
        }
    }

    //Send the question
    const QuestionEmbed = new Discord.RichEmbed()
        .setAuthor(message.author.tag, message.author.avatarURL)
        .setColor(bot.settings.embedColor)
        .addField("Category", category, true)
        .addField("Type", type, true)
        .addField("Difficulty/Prize", `${difficulty}`, true)
        .addField("Question", question)
        .addField("Choices", choicesPreview)
        .setFooter("Type the letter of the choice to answer the question. | You have 60 seconds to answer.",
            bot.user.avatarURL);
    message.channel.send(QuestionEmbed);

    //Start collecting the answer from the user
    const filter = m => m.author.id === message.author.id;
    const answerCollector = message.channel.createMessageCollector(filter, {
        max: 1,
        time: 60000
    });

    //When a message is collected. Using 'end' event since we only have maximum of 1 message
    answerCollector.on('end', collected => {
       const answerMessage = collected.first();

       if (collected.size < 1){ //If time is out

           //Preparing the embed
           const lostEmbed = new Discord.RichEmbed()
               .setAuthor(message.author.tag, message.author.avatarURL)
               .setColor(bot.settings.embedColor)
               .setDescription(`⏰ Time is out!`);
           message.channel.send(lostEmbed);

       }else if (answerMessage.content.toUpperCase() === correctLetter){ //If correct answer
           coinsSchema.findOne({
               guildID: message.guild.id,
               userID: message.author.id
           }, (err, res) => {
               if (err) {
                   console.log(err);
                   errors.databaseError(message);
               }

               //Prize ranging according to difficulty
               let min;
               let max;
               if (difficulty === "easy"){
                   min = Math.ceil(100);
                   max = Math.floor(300 + 1);
               }else if (difficulty === "medium"){
                   min = Math.ceil(300);
                   max = Math.floor(600 + 1);
               }else {
                   min = Math.ceil(600);
                   max = Math.floor(1000 + 1);
               }
               const toEarn = Math.floor(Math.random() * (max - min) + min);

               //Preparing the embed
               const wonEmbed = new Discord.RichEmbed()
                   .setAuthor(message.author.tag, message.author.avatarURL)
                   .setColor(bot.settings.embedColor)
                   .setDescription(`✅ Correct! You have earned the ${toEarn} coins`);

               if (!res) {
                   const newData = new coinsSchema({
                       guildID: message.guild.id,
                       userID: message.author.id,
                       coins: toEarn
                   });
                   newData.save().catch(err => {
                       console.log(err);
                       errors.databaseError(message);
                   });
               }else{
                   res.coins += toEarn;
                   res.save().catch(err => {
                       console.log(err);
                       errors.databaseError(message);
                   });
               }
               message.channel.send(wonEmbed);
           });
       }else{ //If wrong answer
           //Preparing the embed
           const lostEmbed = new Discord.RichEmbed()
               .setAuthor(message.author.tag, message.author.avatarURL)
               .setColor(bot.settings.embedColor)
               .setDescription(`❌ Incorrect! The correct answer is **${decoder(correctAnswer)}(${correctLetter})**`);
           message.channel.send(lostEmbed);
       }
    });
};

module.exports.config = {
    name: "trivia",
    usage: "trivia",
    description: "Play trivia questions to earn coins.",
    aliases: [],
    noalias: "No alias",
    permission: [],
    enabled: true
};