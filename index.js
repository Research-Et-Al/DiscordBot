const Discord = require("discord.js");
const client = new Discord.Client({intents: ["GUILDS", "GUILD_MESSAGES"]});
const { MessageEmbed } = require('discord.js');
const prefix="ylc";
const dotenv = require('dotenv').config()
const yaml = require('js-yaml');
const fs   = require('fs');
const express=require('express');
const app=express();
const bodyParser = require("body-parser")
const puppeteer = require('puppeteer');
const potd = require("./paperoftheday.json");
var loaded= false;
let social_papers=[];
let top_5_social_papers=[];
let latest_papers=[];
let top_5_latest_papers=[];
let greatest_papers=[];
let top_5_greatest_papers=[];
let trending_papers=[];
let top_5_trending_papers=[];
let colors=['#FF0000','#FFC000','#FFFC00','#FF0000','#00FFFF','#FF0000']
const wyd_responses=[
    'Search for the orphanage you came from so I can send you back.',
    'Meditating. Be quiet',
    'Minding my own business. You should try it.',
    'Pretending to be invisible',
    'Changing the config settings for NASA satellites. Same old same old, you know how it is.',
    'Living the dream.',
    'Planning to take over the world. You know. The usual.',
    'Enslaving humanity one sandwich at a time. Would you like some lunch?',
    'Inventing time travel. I\'ll let you know how it works out last week.'

]

function update_paper_of_the_day(write_object){
    fs.readFile('./paperoftheday.json', (err, data) => {
        if (err) throw err;
        var doc = JSON.parse(data);
        //if the date is not in the file, add it
        if (doc.findIndex(x => x.date === write_object.date) === -1){
            doc.push(write_object);
            fs.writeFile('./paperoftheday.json', JSON.stringify(doc), (err) => {
                if (err) throw err;
                console.log('Paper of the day updated!');
                const channel=client.channels.cache.find(channel => channel.id === process.env.CHANNEL_ID);
                const blogEmbed = new MessageEmbed()
                //set color to random from colors array
                .setColor(colors[Math.floor(Math.random() * colors.length)])
                .setTitle('Paper of the Day 📝 ')
                .setDescription('The paper of the day is:')
                .addFields(
                    { name: 'Title', value: doc[doc.findIndex(x => x.date === write_object.date)].title, inline: false },
                    { name:'Description', value: doc[doc.findIndex(x => x.date === write_object.date)].description, inline: false},
                    // { name: '\u200B', value: '\u200B' },
                )
                .setTimestamp()
                .setURL(doc[doc.findIndex(x => x.date === write_object.date)].link)
                .setFooter({ text: 'Research et Al', iconURL: 'https://i.imgur.com/eBiE8DT.png' });
                channel.send({ embeds: [blogEmbed] });
            });
        }
        //if the date is in the file, send the paper of the day
        else{
            console.log("Date already in file!");
            //create embed for the paper of the day
            const channel=client.channels.cache.find(channel => channel.id === process.env.CHANNEL_ID);
            const blogEmbed = new MessageEmbed()
            .setColor(colors[Math.floor(Math.random() * colors.length)])
            .setTitle('Paper of the Day 📝 ')
            .setDescription('The paper of the day is:')
            .addFields(
                { name: 'Title', value: doc[doc.findIndex(x => x.date === write_object.date)].title, inline: false },
                { name:'Description', value: doc[doc.findIndex(x => x.date === write_object.date)].description, inline: false},
                // { name: '\u200B', value: '\u200B' },
            )
            .setTimestamp()
            .setURL(doc[doc.findIndex(x => x.date === write_object.date)].link)
            .setFooter({ text: 'Research et Al', iconURL: 'https://i.imgur.com/eBiE8DT.png' });
            channel.send({ embeds: [blogEmbed] });
                

        }
    })
}


function scrap_data(query){
    const scrap = async () =>{
        const browser = await puppeteer.launch({headless : true});
        const page = await browser.newPage();
        await page.goto('https://paperswithcode.com'+query, {waitUntil : 'domcontentloaded'}) // navigate to url and wait for page loading
        
        const result = await page.evaluate(() => {
            hrefs_list=[... new Set(Array.from(
                document.querySelectorAll('.badge-light'),
                a => a.getAttribute('href')
              ))];
              for(i=0;i<hrefs_list.length;i++){
                hrefs_list[i]='https://paperswithcode.com'+hrefs_list[i].split("#")[0]
              }
              
            hrefs_list=[...new Set(hrefs_list.filter(a=>a.includes("/paper/") || a.includes("/search?")))]
            
        return {
               hrefs:hrefs_list,
               data:document.querySelector('.home-page').innerText.split("\n").filter(x => x!=' ' && x!= '')
           }
        });
        await browser.close();
        return result;
    
    }
    scrap().then(obj => {
        arr=obj.data;
        let hrefs_list=obj.hrefs;
        const res = [];
        var temp=[];
    if (query === "/top-social"){
        for (let i = 0; i < arr.length; i += 1) {
            if (arr[i] == 'TWEETS') {
                temp.push(hrefs_list[0])
                res.push(temp);
                hrefs_list=hrefs_list.slice(1);
                temp = [];
            }
            else{
                temp.push(arr[i]);
            }
        }
        social_papers=res;
        top_5_social_papers=social_papers.slice(0,5);
        loaded=true;
    }
    else if (query === "/latest"){
        for (let i = 0; i < arr.length; i += 1) {
            if (arr[i] == ' Code') {
                temp.push(hrefs_list[0])
                res.push(temp);
                hrefs_list=hrefs_list.slice(1);
                temp = [];
            }
            else{
                temp.push(arr[i]);
            }
        }

        latest_papers=res;
        top_5_latest_papers=latest_papers.slice(0,5);
        loaded=true;

    }
    else if (query === "/greatest" || query === "/latest" || query === "/"){
        for (let i = 0; i < arr.length; i += 1) {
            if (arr[i] == ' Code') {
                temp.push(hrefs_list[0])
                res.push(temp);
                hrefs_list=hrefs_list.slice(1);
                temp = [];
            }
            else{
                temp.push(arr[i]);
            }
        }
        if(query === "/latest"){
        latest_papers=res;
        top_5_latest_papers=latest_papers.slice(0,5);
        loaded=true;
        }
        else if(query === "/greatest"){
        greatest_papers=res;
        top_5_greatest_papers=greatest_papers.slice(0,5);
        loaded=true;
        }
        else{
        trending_papers=res;
        top_5_trending_papers=trending_papers.slice(0,5);
        loaded=true;
        }

    }

    });
}
scrap_data("/top-social");
scrap_data("/latest");
scrap_data("/greatest");
scrap_data("/");
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

app.get("/blog", function(req,res) {
    console.log(req.query)
    const channel=client.channels.cache.find(channel => channel.id === process.env.CHANNEL_ID);
    const blogEmbed = new MessageEmbed()
    .setColor('#8c52ff')
    .setTitle('New Blog Post')
    .setDescription('Oooh\n Looks like we have a new blog post by '+req.query.name+'!')
    .setThumbnail(req.query.blogImg)
    .addFields(
        { name: req.query.blogName, value: req.query.blogContent, inline: false },
        // { name: '\u200B', value: '\u200B' },
    )
    .setTimestamp()
    .setURL(req.query.blogURL)
    .setFooter({ text: 'Research et Al', iconURL: 'https://i.imgur.com/eBiE8DT.png' });
    channel.send({ embeds: [blogEmbed] });
  });

  

client.on("messageCreate", function(message) { 
    if (message.author.bot) return;
    var msgtok = message.content.toLowerCase().split(" ");
    var command= msgtok[1]
    if (msgtok[0] != prefix){
        return;
    }
    
    // const commandBody = message.content.slice(prefix.length);
    // const args = commandBody.split(' ');
    // const command = args.shift().toLowerCase();   
    const channel=client.channels.cache.find(channel => channel.id === process.env.CHANNEL_ID);
    if (command === "ping") {
        const timeTaken = Date.now() - message.createdTimestamp;
        message.reply(`Hello! This message had a latency of ${timeTaken}ms.`);                    
    } 
    else if (command === "wyd" || command === "wassup"|| command === "sup") {
        // random element from wyd_responses
        message.reply(wyd_responses[wyd_responses.length * Math.random() | 0]);

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
    else if (command === "hot" || command === "🔥") {
        //Have to add links to each of these
        if (loaded){
            const exampleEmbed = new MessageEmbed()
            .setColor('#8c52ff')
            .setTitle('Hot Research on Social Media')
            .setDescription('These are the top 5 🔥 papers on social media')
            .setThumbnail('https://i.imgur.com/eBiE8DT.png')
            .addFields(
                { name: top_5_social_papers[0][0], value: top_5_social_papers[0][2], inline: false },
                {name:"Link",value:"[Click Here to go to the website]("+top_5_social_papers[0].at(-1)+")", inline:false},
                { name: '\u200B', value: '\u200B' },
                { name: top_5_social_papers[1][0], value: top_5_social_papers[1][2], inline: false },
                {name:"Link",value:"[Click Here to go to the website]("+top_5_social_papers[1].at(-1)+")", inline:false},
                { name: '\u200B', value: '\u200B' },
                { name: top_5_social_papers[2][0], value: top_5_social_papers[2][2], inline: false },
                {name:"Link",value:"[Click Here to go to the website]("+top_5_social_papers[2].at(-1)+")", inline:false},
                { name: '\u200B', value: '\u200B' },
                { name: top_5_social_papers[3][0], value: top_5_social_papers[3][2], inline: false },
                {name:"Link",value:"[Click Here to go to the website]("+top_5_social_papers[3].at(-1)+")", inline:false},
                { name: '\u200B', value: '\u200B' },
                { name: top_5_social_papers[4][0], value: top_5_social_papers[4][2], inline: false },
                {name:"Link",value:"[Click Here to go to the website]("+top_5_social_papers[4].at(-1)+")", inline:false},
                { name: '\u200B', value: '\u200B' },
            )
            .setTimestamp()
            .setFooter({ text: 'Research et Al', iconURL: 'https://i.imgur.com/eBiE8DT.png' });

            channel.send({ embeds: [exampleEmbed] });
            
            
        }

        else{
            channel.send("Loading...");
        }
    }
    else if (command === "new" || command === "latest"){
        if (loaded){
            const exampleEmbed = new MessageEmbed()
            .setColor('#8c52ff')
            .setTitle('Latest Research Papers')
            .setDescription('These are the top 5 newest papers')
            .setThumbnail('https://i.imgur.com/eBiE8DT.png')
            .addFields(
                { name: top_5_latest_papers[0][0], value: top_5_latest_papers[0][2], inline: false },
                {name:"Link",value:"[Click Here to go to the website]("+top_5_latest_papers[0].at(-1)+")", inline:false},
                { name: '\u200B', value: '\u200B' },
                { name: top_5_latest_papers[1][0], value: top_5_latest_papers[1][2], inline: false },
                {name:"Link",value:"[Click Here to go to the website]("+top_5_latest_papers[1].at(-1)+")", inline:false},
                { name: '\u200B', value: '\u200B' },
                { name: top_5_latest_papers[2][0], value: top_5_latest_papers[2][2], inline: false },
                {name:"Link",value:"[Click Here to go to the website]("+top_5_latest_papers[2].at(-1)+")", inline:false},
                { name: '\u200B', value: '\u200B' },
                { name: top_5_latest_papers[3][0], value: top_5_latest_papers[3][2], inline: false },
                {name:"Link",value:"[Click Here to go to the website]("+top_5_latest_papers[3].at(-1)+")", inline:false},
                { name: '\u200B', value: '\u200B' },
                { name: top_5_latest_papers[4][0], value: top_5_latest_papers[4][2], inline: false },
                {name:"Link",value:"[Click Here to go to the website]("+top_5_latest_papers[4].at(-1)+")", inline:false},
                { name: '\u200B', value: '\u200B' },

            )
            .setTimestamp()
            .setFooter({ text: 'Research et Al', iconURL: 'https://i.imgur.com/eBiE8DT.png' });

            channel.send({ embeds: [exampleEmbed] });
            
            
        }
        
        else{
            channel.send("Loading...");
        }

    }
    else if (command === "greatest" || command === "goat" || command === "🐐"){
        //Have to add links to each of these
        if (loaded){
            const exampleEmbed = new MessageEmbed()
            .setColor('#8c52ff')
            .setTitle('Greatest Research Papers')
            .setDescription('These are the top 5 greatest papers 🐐')
            .setThumbnail('https://i.imgur.com/eBiE8DT.png')
            .addFields(
                { name: top_5_greatest_papers[0][0], value: top_5_greatest_papers[0][2], inline: false },
                {name:"Link",value:"[Click Here to go to the website]("+top_5_greatest_papers[0].at(-1)+")", inline:false},
                { name: '\u200B', value: '\u200B' },
                { name: top_5_greatest_papers[1][0], value: top_5_greatest_papers[1][2], inline: false },
                {name:"Link",value:"[Click Here to go to the website]("+top_5_greatest_papers[1].at(-1)+")", inline:false},
                { name: '\u200B', value: '\u200B' },
                { name: top_5_greatest_papers[2][0], value: top_5_greatest_papers[2][2], inline: false },
                {name:"Link",value:"[Click Here to go to the website]("+top_5_greatest_papers[2].at(-1)+")", inline:false},
                { name: '\u200B', value: '\u200B' },
                { name: top_5_greatest_papers[3][0], value: top_5_greatest_papers[3][2], inline: false },
                {name:"Link",value:"[Click Here to go to the website]("+top_5_greatest_papers[3].at(-1)+")", inline:false},
                { name: '\u200B', value: '\u200B' },
                { name: top_5_greatest_papers[4][0], value: top_5_greatest_papers[4][2], inline: false },
                {name:"Link",value:"[Click Here to go to the website]("+top_5_greatest_papers[4].at(-1)+")", inline:false},
                { name: '\u200B', value: '\u200B' },

            )
            .setTimestamp()
            .setFooter({ text: 'Research et Al', iconURL: 'https://i.imgur.com/eBiE8DT.png' });

            channel.send({ embeds: [exampleEmbed] });
            
            
        }
        
        else{
            channel.send("Loading...");
        }
    }
    else if (command === "trending"){
        //Have to add links to each of these
        if (loaded){
            const exampleEmbed = new MessageEmbed()
            .setColor('#8c52ff')
            .setTitle('Trending Research Papers')
            .setDescription('These are the top 5 trending papers')
            .setThumbnail('https://i.imgur.com/eBiE8DT.png')
            .addFields(
                { name: top_5_trending_papers[0][0], value: top_5_trending_papers[0][2], inline: false },
                {name:"Link",value:"[Click Here to go to the website]("+top_5_trending_papers[0].at(-1)+")", inline:false},
                { name: '\u200B', value: '\u200B' },
                { name: top_5_trending_papers[1][0], value: top_5_trending_papers[1][2], inline: false },
                {name:"Link",value:"[Click Here to go to the website]("+top_5_trending_papers[1].at(-1)+")", inline:false},
                { name: '\u200B', value: '\u200B' },
                { name: top_5_trending_papers[2][0], value: top_5_trending_papers[2][2], inline: false },
                {name:"Link",value:"[Click Here to go to the website]("+top_5_trending_papers[2].at(-1)+")", inline:false},
                { name: '\u200B', value: '\u200B' },
                { name: top_5_trending_papers[3][0], value: top_5_trending_papers[3][2], inline: false },
                {name:"Link",value:"[Click Here to go to the website]("+top_5_trending_papers[3].at(-1)+")", inline:false},
                { name: '\u200B', value: '\u200B' },
                { name: top_5_trending_papers[4][0], value: top_5_trending_papers[4][2], inline: false },
                {name:"Link",value:"[Click Here to go to the website]("+top_5_trending_papers[4].at(-1)+")", inline:false},
                { name: '\u200B', value: '\u200B' },

            )
            .setTimestamp()
            .setFooter({ text: 'Research et Al', iconURL: 'https://i.imgur.com/eBiE8DT.png' });

            channel.send({ embeds: [exampleEmbed] });
            
            
        }
        
        else{
            channel.send("Loading...");
        }
    }
    else if (command === "potd"){
       chosen_paper=latest_papers[latest_papers.length * Math.random() | 0]
        write_object={
            "title":chosen_paper[0],
            "link":chosen_paper.at(-1),
            "description":chosen_paper[2],
            "date":new Date().toLocaleDateString("en-US")
        }   

        update_paper_of_the_day(write_object);

    }
    else{
        channel.send("I'm sorry I didn't quite get that. Please try again.");
    }
}); 

client.login(process.env.BOT_TOKEN);

app.listen(process.env.PORT, function(){
    console.log("The Server is running on port 3000");
  })
