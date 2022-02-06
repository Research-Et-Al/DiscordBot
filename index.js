const Discord = require("discord.js");
const client = new Discord.Client({intents: ["GUILDS", "GUILD_MESSAGES"]});
const prefix="!";
const dotenv = require('dotenv').config()


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
}); 

client.login(process.env.BOT_TOKEN);

