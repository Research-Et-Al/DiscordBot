const Discord = require("discord.js");
const client = new Discord.Client({intents: ["GUILDS", "GUILD_MESSAGES"]});
const { MessageEmbed } = require('discord.js');
const prefix="!";
const dotenv = require('dotenv').config()
const yaml = require('js-yaml');
const fs   = require('fs');
const express=require('express');
const app=express();
const bodyParser = require("body-parser")

app.use(bodyParser.urlencoded({
    extended:true
}));


let doc = yaml.load(fs.readFileSync('./conferences.yml', 'utf8'));
doc.sort((a, b) => (Date.parse(a.deadline)) - Date.parse((b.deadline)));
doc=doc.filter(function(conference){return Date.parse(conference.deadline)>Date.now() && conference.year >= 2022});


app.get("/", function() {
    const channel=client.channels.cache.find(channel => channel.id === process.env.CHANNEL_ID);
    channel.send("This is an automated message sent from port "+ process.env.PORT);
  });




client.on("messageCreate", function(message) { 
    if (message.author.bot) return;
    if (!message.content.startsWith(prefix)) return;
    const commandBody = message.content.slice(prefix.length);
    const args = commandBody.split(' ');
    const command = args.shift().toLowerCase();   
    const channel=client.channels.cache.find(channel => channel.id === process.env.CHANNEL_ID);
    if (command === "ping") {
        const timeTaken = Date.now() - message.createdTimestamp;
        message.reply(`Hello! This message had a latency of ${timeTaken}ms.`);                    
    }      
    else if (command === "test") {
       channel.send(message.author.username + " has tested the bot!");
    }     
    else if (command === "conferences") {
    // inside a command, event listener, etc.
    const exampleEmbed = new MessageEmbed()
    .setColor('#8c52ff')
    .setTitle('Upcoming Conferences')
    .setDescription('These are 5 upcoming conferences')
    .setThumbnail('https://i.imgur.com/eBiE8DT.png')
    .addFields(
        { name: doc[0].title+" held from "+doc[0].date, value: doc[0].link, inline: false },
        // { name: '\u200B', value: '\u200B' },
        { name: doc[1].title+" held from "+doc[1].date, value: doc[1].link, inline: false },
        // { name: '\u200B', value: '\u200B' },
        { name: doc[2].title+" held from "+doc[2].date, value: doc[2].link, inline: false },
        // { name: '\u200B', value: '\u200B' },
        { name: doc[3].title+" held from "+doc[3].date, value: doc[3].link, inline: false },
        // { name: '\u200B', value: '\u200B' },
        { name: doc[4].title+" held from "+doc[4].date, value: doc[4].link, inline: false },
        // { name: '\u200B', value: '\u200B' },
    )
    .setTimestamp()
    .setFooter({ text: 'Research et Al', iconURL: 'https://i.imgur.com/eBiE8DT.png' });

    channel.send({ embeds: [exampleEmbed] });
        }          
        
    else if (command === "instagram") {
        channel.send("https://www.instagram.com/etal.pesu/");
    }
    else if (command === "github") {
        channel.send("https://github.com/Research-Et-Al");
    }
    else if (command === "linkedin") {
        channel.send("https://www.linkedin.com/company/pesu-research-et-al/");
    }
    else{
        channel.send("I'm sorry I didn't quite get that. Please try again.");
    }
}); 

client.login(process.env.BOT_TOKEN);

app.listen(process.env.PORT, function(){
    console.log("The Server is running on port 3000");
  })

