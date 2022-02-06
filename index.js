const Discord = require("discord.js");
const client = new Discord.Client({intents: ["GUILDS", "GUILD_MESSAGES"]});
const prefix="!";
const dotenv = require('dotenv').config()
const yaml = require('js-yaml');
const fs   = require('fs');
const doc = yaml.load(fs.readFileSync('./conferences.yml', 'utf8'));
doc.sort((a, b) => (Date.parse(a.deadline)) - Date.parse((b.deadline)));
const { MessageEmbed } = require('discord.js');

client.on("messageCreate", function(message) { 
    if (message.author.bot) return;
    if (!message.content.startsWith(prefix)) return;
    const commandBody = message.content.slice(prefix.length);
    const args = commandBody.split(' ');
    const command = args.shift().toLowerCase();   
    if (command === "ping") {
        const timeTaken = Date.now() - message.createdTimestamp;
        message.reply(`Hello! This message had a latency of ${timeTaken}ms.`);                    
    }      
    else if (command === "test") {
       const channel=client.channels.cache.find(channel => channel.id === process.env.CHANNEL_ID);
       channel.send(message.author.username + " has tested the bot!");
    }     
    else if (command === "conferences") {
        const channel=client.channels.cache.find(channel => channel.id === process.env.CHANNEL_ID);
        // inside a command, event listener, etc.
    const exampleEmbed = new MessageEmbed()
    .setColor('#0099ff')
    .setTitle('Upcoming Conferences')
    .setURL('https://discord.js.org/')
    .setDescription('These are 5 upcoming conferences')
    .setThumbnail('https://i.imgur.com/eBiE8DT.png')
    .addFields(
        { name: doc[0].title+" held from "+doc[0].date, value: doc[0].link, inline: false },
        { name: '\u200B', value: '\u200B' },
        { name: doc[1].title+" held from "+doc[1].date, value: doc[1].link, inline: false },
        { name: '\u200B', value: '\u200B' },
        { name: doc[2].title+" held from "+doc[2].date, value: doc[2].link, inline: false },
        { name: '\u200B', value: '\u200B' },
        { name: doc[3].title+" held from "+doc[3].date, value: doc[3].link, inline: false },
        { name: '\u200B', value: '\u200B' },
        { name: doc[4].title+" held from "+doc[4].date, value: doc[4].link, inline: false },
        // { name: '\u200B', value: '\u200B' },
    )
    .setTimestamp()
    .setFooter({ text: 'Research et Al', iconURL: 'https://i.imgur.com/eBiE8DT.png' });

    channel.send({ embeds: [exampleEmbed] });
        }                       
}); 

client.login(process.env.BOT_TOKEN);

