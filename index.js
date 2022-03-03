const Discord = require("discord.js");
const client = new Discord.Client({
  intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_MEMBERS"],
});
const { MessageEmbed } = require("discord.js");
const fetch = require("node-fetch");
const prefix = "ylc";
const dotenv = require("dotenv").config();
const yaml = require("js-yaml");
const fs = require("fs");
const express = require("express");
const mongoose = require("mongoose");
const User = require("./models/User");

//Connect to the Database
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MongoDB Connected");
  })
  .catch((err) => console.log(err));

const app = express();
const bodyParser = require("body-parser");
const puppeteer = require("puppeteer");
const potd = require("./paperoftheday.json");
const { MessageActionRow, MessageSelectMenu } = require("discord.js");
var loaded = false;
let social_papers = [];
let top_5_social_papers = [];
let latest_papers = [];
let top_5_latest_papers = [];
let greatest_papers = [];
let top_5_greatest_papers = [];
let trending_papers = [];
let top_5_trending_papers = [];
let colors = [
  "#FF0000",
  "#FFC000",
  "#FFFC00",
  "#FF0000",
  "#00FFFF",
  "#FF0000",
  "#8c52ff",
  "#5cf000",
];
let domains = {
  ML: ["Machine Learning", "https://i.imgur.com/ZLRhN5e.png"],
  AI: "Artificial Intelligence",
  CV: ["Computer Vision", "https://i.imgur.com/tRGQP7D.png"],
  RO: ["Robotics", "https://i.imgur.com/fF9LVk7.png"],
  DM: "Data Mining",
  SP: "Speech Processing",
  DS: "Data Science",
  DL: "Deep Learning",
  NLP: "Natural Language Processing",
};

//Welcome Message ✅
//Roles by Reaction
//Slash Commands
//Wishlist ✅ (Partially)
//Level Up System

const wyd_responses = [
  "Searching for the orphanage you came from so I can send you back.",
  "Meditating. Be quiet",
  "Minding my own business. You should try it.",
  "Pretending to be invisible",
  "Changing the config settings for NASA satellites. Same old same old, you know how it is.",
  "Living the dream.",
  "Planning to take over the world. You know. The usual.",
  "Enslaving humanity one sandwich at a time. Would you like some lunch?",
  "Inventing time travel. I'll let you know how it works out last week.",
];

// function add_xp(message, xp) {
//   User.findOne({
//     id: message.author.id,
//   }).then((user
//     ) => {
//     if (user) {
//       user.xp += xp;
//       user.save().then((user) => {
//         console.log(`${user.name} has gained ${xp} xp`);
//         if (user.xp >= user.level * 10) {
//           user.level += 1;
//           user.xp = 0;
//           user.save().then((user) => {
//             console.log(`${user.name} has leveled up to level ${user.level}`);
//             //Send a message to the user
//             message.channel.send(
//               `${user.name} has leveled up to level ${user.level}`
//             );
//           });
//         }
//       });
//     }
//     else{
//       new_user = new User({
//         id: message.author.id,
//         name: message.author.username,
//         xp: xp,
//         level: 1,
//         wishlist: [],
//         blogs: [],
//       });

//       new_user.save().then((user) => {
//         console.log(`${user.name} has gained ${xp} xp`);
//         if (user.xp >= user.level * 10) {
//           user.level += 1;
//           user.xp = 0;
//           user.save().then((user) => {
//             console.log(`${user.name} has leveled up to level ${user.level}`);
//             //Send a message to the user
//             message.channel.send(
//               `${user.name} has leveled up to level ${user.level}`
//             );
//           });
//         }

//       });

//     }
//   });
// }
//Update Paper of the Day if it isn't updated in the JSON file
function update_paper_of_the_day(write_object, channel_id) {
  console.log(channel_id);
  const channel = client.channels.cache.get(channel_id);
  fs.readFile("./paperoftheday.json", (err, data) => {
    if (err) throw err;
    var doc = JSON.parse(data);
    //if the date is not in the file add the paper
    if (doc.findIndex((x) => x.date === write_object.date) === -1) {
      doc.push(write_object);
      fs.writeFile("./paperoftheday.json", JSON.stringify(doc), (err) => {
        if (err) throw err;
        console.log("Paper of the day updated!");
        const potdEmbed = new MessageEmbed()
          //set color to random from colors array
          .setColor(colors[Math.floor(Math.random() * colors.length)])
          .setTitle("Paper of the Day 📝 ")
          .setImage("https://i.imgur.com/12abBCa.png")
          .setDescription("The paper of the day is:")
          .addFields(
            {
              name: "Title",
              value:
                doc[doc.findIndex((x) => x.date === write_object.date)].title,
              inline: false,
            },
            {
              name: "Description",
              value:
                doc[doc.findIndex((x) => x.date === write_object.date)]
                  .description,
              inline: false,
            }
            ////  { name: '\u200B', value: '\u200B' },
          )
          .setTimestamp()
          .setURL(doc[doc.findIndex((x) => x.date === write_object.date)].link)
          .setFooter({
            text: "Research et Al",
            iconURL: "https://i.imgur.com/eBiE8DT.png",
          });
        channel.send({ embeds: [potdEmbed] });
      });
    }
    //if the date is in the file, send the paper of the day
    else {
      console.log("Date already in file!");
      //create embed for the paper of the day
      const channel = client.channels.cache.find(
        (channel) => channel.id === channel_id
      );
      const potdEmbed = new MessageEmbed()
        .setColor(colors[Math.floor(Math.random() * colors.length)])
        .setTitle("Paper of the Day 📝 ")
        .setImage("https://i.imgur.com/12abBCa.png")
        .setDescription("The paper of the day is:")
        .addFields(
          {
            name: "Title",
            value:
              doc[doc.findIndex((x) => x.date === write_object.date)].title,
            inline: false,
          },
          {
            name: "Description",
            value:
              doc[doc.findIndex((x) => x.date === write_object.date)]
                .description,
            inline: false,
          }
          ////  { name: '\u200B', value: '\u200B' },
        )
        .setTimestamp()
        .setURL(doc[doc.findIndex((x) => x.date === write_object.date)].link)
        .setFooter({
          text: "Research et Al",
          iconURL: "https://i.imgur.com/eBiE8DT.png",
        });
      channel.send({ embeds: [potdEmbed] });
    }
  });
}

//Function to get all the data from paperswithcode.com
function scrape_data(query) {
  const scrape = async () => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto("https://paperswithcode.com" + query, {
      waitUntil: "domcontentloaded",
    }); // navigate to url and wait for page loading

    const result = await page.evaluate(() => {
      hrefs_list = [
        ...new Set(
          Array.from(document.querySelectorAll(".badge-light"), (a) =>
            a.getAttribute("href")
          )
        ),
      ];
      for (i = 0; i < hrefs_list.length; i++) {
        hrefs_list[i] =
          "https://paperswithcode.com" + hrefs_list[i].split("#")[0];
      }

      hrefs_list = [
        ...new Set(
          hrefs_list.filter(
            (a) => a.includes("/paper/") || a.includes("/search?")
          )
        ),
      ];

      return {
        hrefs: hrefs_list,
        data: document
          .querySelector(".home-page")
          .innerText.split("\n")
          .filter((x) => x != " " && x != ""),
      };
    });
    await browser.close();
    return result;
  };
  scrape().then((obj) => {
    arr = obj.data;
    let hrefs_list = obj.hrefs;
    const res = [];
    var temp = [];
    if (query === "/top-social") {
      for (let i = 0; i < arr.length; i += 1) {
        if (arr[i] == "TWEETS") {
          temp.push(hrefs_list[0]);
          res.push(temp);
          hrefs_list = hrefs_list.slice(1);
          temp = [];
        } else {
          temp.push(arr[i]);
        }
      }
      social_papers = res;
      top_5_social_papers = social_papers.slice(0, 5);
      loaded = true;
    } else if (query === "/latest") {
      for (let i = 0; i < arr.length; i += 1) {
        if (arr[i] == " Code") {
          temp.push(hrefs_list[0]);
          res.push(temp);
          hrefs_list = hrefs_list.slice(1);
          temp = [];
        } else {
          temp.push(arr[i]);
        }
      }

      latest_papers = res;
      top_5_latest_papers = latest_papers.slice(0, 5);
      loaded = true;
    } else if (query === "/greatest" || query === "/latest" || query === "/") {
      for (let i = 0; i < arr.length; i += 1) {
        if (arr[i] == " Code") {
          temp.push(hrefs_list[0]);
          res.push(temp);
          hrefs_list = hrefs_list.slice(1);
          temp = [];
        } else {
          temp.push(arr[i]);
        }
      }
      if (query === "/latest") {
        latest_papers = res;
        top_5_latest_papers = latest_papers.slice(0, 5);
        loaded = true;
      } else if (query === "/greatest") {
        greatest_papers = res;
        top_5_greatest_papers = greatest_papers.slice(0, 5);
        loaded = true;
      } else {
        trending_papers = res;
        top_5_trending_papers = trending_papers.slice(0, 5);
        loaded = true;
      }
    }
  });
}
scrape_data("/top-social");
scrape_data("/latest");
scrape_data("/greatest");
scrape_data("/");

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
//Conferences from the website repository
let doc = yaml.load(fs.readFileSync("./conferences.yml", "utf8"));
doc.sort((a, b) => Date.parse(a.deadline) - Date.parse(b.deadline));
doc = doc.filter(function (conference) {
  return (
    Date.parse(conference.deadline) > Date.now() && conference.year >= 2022
  );
});
// app.get("/", function () {
//   const channel = client.channels.cache.find(
//     (channel) => channel.id === process.env.CHANNEL_ID
//   );
//   channel.send(
//     "This is an automated message sent from port " + process.env.PORT
//   );
// });

//Send a message to the channel if there's a new post
app.get("/blog", function (req, res) {
  const channel = client.channels.cache.find(
    (channel) => channel.id === process.env.CHANNEL_ID
  );
  const blogEmbed = new MessageEmbed()
    .setColor(colors[Math.floor(Math.random() * colors.length)])
    .setTitle("New Blog Post")
    .setDescription(
      "Oooh\n Looks like we have a new blog post by " + req.query.name + "!"
    )
    .setThumbnail(req.query.blogImg)
    .addFields(
      {
        name: "**" + req.query.blogName + "**",
        value: req.query.blogContent,
        inline: false,
      }
      ////  { name: '\u200B', value: '\u200B' },
    )
    .setTimestamp()
    .setURL(req.query.blogURL)
    .setFooter({
      text: "Research et Al",
      iconURL: "https://i.imgur.com/eBiE8DT.png",
    });
  channel.send({ embeds: [blogEmbed] });
});

//Send a message if someone joins the channel
client.on("guildMemberAdd", async (member) => {
  console.log("New Member Joined");

  const welcomeEmbed = new MessageEmbed();
  // member.roles.add(member.guild.roles.cache.find(role => role.name === 'Computer Vision'))

  welcomeEmbed.setColor("#5cf000");
  welcomeEmbed.setTitle(member.user.username + " is now Among Us ");
  welcomeEmbed.setDescription("Welcome to the server!");
  welcomeEmbed.setTimestamp();
  welcomeEmbed.setImage(
    "https://cdn.mos.cms.futurecdn.net/93GAa4wm3z4HbenzLbxWeQ-650-80.jpg.webp"
  );

  member.guild.channels.cache
    .find((channel) => channel.id === process.env.WELCOME_CHANNEL_ID)
    .send({ embeds: [welcomeEmbed] });
});

client.on("ready", () => {
  client.user.setActivity("you learn about research related matters", {
    type: "WATCHING",
  });
  console.log("Bot is ready");
});

client.on("messageCreate", async function (message) {
  if (message.author.bot) return;
  var msgtok = message.content.toLowerCase().split(" "); //Tokenize the message
  var command = msgtok[1];
  if (msgtok[0] != prefix) {
    return;
  }

  // const commandBody = message.content.slice(prefix.length);
  // const args = commandBody.split(' ');
  // const command = args.shift().toLowerCase();
  const channel = client.channels.cache.find(
    (channel) => channel.id === message.channel.id
  );
  if (command === "ping") {
    const timeTaken = Date.now() - message.createdTimestamp;
    message.reply(`Hello! This message had a latency of ${timeTaken}ms.`);
  } else if (command === "upcoming") {
    //create embed for upcoming events
    const upcomingEmbed = new MessageEmbed()
      .setColor(colors[Math.floor(Math.random() * colors.length)])
      .setTitle("Upcoming Events")
      .setDescription("Here are the upcoming events!")
      .addFields(
        {
          name: "**" + "έρευνα (Erevna)" + "**",
          value:
            "Want to publish a scientific paper but don't know where to start? Don't worry, we have got you covered!\nPresenting to you, έρευνα (Erevna), a 3 week-long event to familiarize students with the proceedings of academic conferences and help them master the art of scientific writing! ✍️",
          inline: false,
        },
        {
          name: "**" + "Registration Link" + "**",
          value: "https://forms.gle/DE3oDQ7BTTknBHwD7",
          inline: false,
        }
      )
      .setImage(
        "https://cdn.discordapp.com/attachments/904777742145437746/944529799488090122/WhatsApp_Image_2022-02-19_at_1.23.14_PM.jpeg"
      )
      .setTimestamp()
      .setFooter({
        text: "Research et Al",
        iconURL: "https://i.imgur.com/eBiE8DT.png",
      });

    channel.send({ embeds: [upcomingEmbed] });
  } else if (command === "excuse") {
    excuse = fetch("https://excuser.herokuapp.com/v1/excuse").then((res) =>
      res.json()
    );
    excuse.then((data) => {
      data = data[0];

      const excuseEmbed = new MessageEmbed()
        .setColor(colors[Math.floor(Math.random() * colors.length)])
        .setTitle("Excuse Generator")
        .setThumbnail(
          "https://styles.redditmedia.com/t5_26eosz/styles/profileIcon_8847im20pb081.jpg"
        )
        .addFields({
          name:
            "**" +
            data.category.charAt(0).toUpperCase() +
            data.category.slice(1) +
            " Excuse" +
            "**",
          value: data.excuse,
          inline: false,
        })

        .setTimestamp()
        .setFooter({
          text: "Research et Al",
          iconURL: "https://i.imgur.com/eBiE8DT.png",
        });

      channel.send({ embeds: [excuseEmbed] });
    });
  } else if (command === "kanye") {
    quote = fetch("https://api.kanye.rest/").then((res) => res.json());
    quote.then((data) => {
      kanyeEmbed = new MessageEmbed()
        .setColor(colors[Math.floor(Math.random() * colors.length)])
        .setTitle("Kanye Quote")
        // .setDescription("Here is your Kanye West quote!")
        .setThumbnail(
          "https://media.vanityfair.com/photos/62093321237a9fc52a53a0d4/3:4/w_2460,h_3280,c_limit/1366417675"
        )
        .addFields({
          name: "\u200B",
          value: "**" + data.quote + "**",
          inline: false,
        })
        .setTimestamp()
        .setFooter({
          text: "Research et Al",
          iconURL: "https://i.imgur.com/eBiE8DT.png",
        });
      channel.send({ embeds: [kanyeEmbed] });
    });
  } else if (command === "fact") {
    fact = fetch("https://uselessfacts.jsph.pl/random.json?language=en").then(
      (res) => res.json()
    );
    fact.then((data) => {
      factEmbed = new MessageEmbed();
      factEmbed.setColor(colors[Math.floor(Math.random() * colors.length)]);
      factEmbed.setTitle("Fact");
      factEmbed.setThumbnail(
        "https://www.changefactory.com.au/wp-content/uploads/2010/09/article-fact-or-opinion.jpg"
      );
      factEmbed.addFields({
        name: "Did you know?",
        value: "**" + data.text + "**",
        inline: false,
      });
      factEmbed.setTimestamp();
      factEmbed.setFooter({
        text: "Research et Al",
        iconURL: "https://i.imgur.com/eBiE8DT.png",
      });
      channel.send({ embeds: [factEmbed] });
    });
  } else if (command === "wyd" || command === "wassup" || command === "sup") {
    console.log(message.channel.id);
    // random element from wyd_responses
    message.reply(wyd_responses[(wyd_responses.length * Math.random()) | 0]);
    // add_xp(message, 1);
  } else if (command === "test") {
    channel.send(message.author.username + " has tested the bot!");
  } else if (command === "save") {
    // message.reply("Here are the papers you have added to your wishlist: " );
    fs.readFile("./paperoftheday.json", (err, data) => {
      if (err) throw err;
      //save the data to doc
      let wishlist = [];
      doc = JSON.parse(data);
      data =
        doc[
          doc.findIndex(
            (x) => x.date === new Date().toLocaleDateString("en-US")
          )
        ];
      wishlist.push(data);
      const new_user = User({
        id: message.author.id,
        name: message.author.username,
        wishlist: wishlist,
        blogs: [],
        // xp: 0,
        // level : 1,
      });
      //check if user exists
      User.findOne({ id: message.author.id }, (err, user) => {
        if (err) throw err;
        if (!user) {
          console.log("User not found, creating new user");
          new_user.save(function (err) {
            if (err) return handleError(err);
            // saved!
            console.log("saved!");
            message.reply("Saved Paper of the Day!");
          });
        } else {
          //check if paper is already in wishlist
          if (user.wishlist.find((x) => x.title === data.title)) {
            message.reply("You have already saved this paper!");
          } else {
            user.wishlist.push(data);
            user.save(function (err) {
              if (err) return handleError(err);
              // saved!
              console.log("saved!");
              message.reply("Saved Paper of the Day!");
            });
          }
        }
      });

      //get paper of the day from paperoftheday.json

      //get wishlist from database
      // for (let i = 0; i < wishlist.length; i += 1) {
      //     message.reply(wishlist[i]);
      // }
      //add paper of the day to wishlist
    });
  } else if (command === "saved") {
    //get wishlist from database
    User.findOne({ id: message.author.id }, function (err, user) {
      if (err) return handleError(err);
      if (user) {
        message.reply("Here are the papers you have saved: ");
        //create embed for wishlist
        var wishlistEmbed = new MessageEmbed()
          .setColor(colors[Math.floor(Math.random() * colors.length)])
          .setTitle("Your Saved Papers 📝")
          // .setDescription('Here are the papers you have saved: ')
          .setTimestamp()
          .setFooter({
            text: "Research et Al",
            iconURL: "https://i.imgur.com/eBiE8DT.png",
          });
        for (let i = 0; i < user.wishlist.length; i += 1) {
          wishlistEmbed.addFields(
            {
              name: "```" + (i + 1) + ") " + user.wishlist[i].title + "```",
              value: user.wishlist[i].description,
              inline: false,
            },
            ////  { name: '\u200B', value: '\u200B' },
            { name: "Link", value: user.wishlist[i].link, inline: false }
          );
        }
        message.channel.send({ embeds: [wishlistEmbed] });
      } else {
        message.reply(
          "You have no papers saved!\n Use `ylc save` to save a paper!"
        );
      }
      // message.channel.send({ embeds: [wishlistEmbed] });
    });
  } else if (command === "remove") {
    index = parseInt(msgtok[2]) - 1;
    User.findOne({ id: message.author.id }, function (err, user) {
      if (err) return handleError(err);
      if (user) {
        if (user.wishlist.length > index) {
          //remove paper at index from wishlist
          user.wishlist.splice(index, 1);
          user.save(function (err) {
            if (err) return handleError(err);
            console.log("removed!");
            message.reply("Removed the Paper!");
          });
        } else {
          message.reply("Please enter a valid number!");
        }
      } else {
        message.reply("You have no papers saved!");
      }
    });
  } else if (command === "roles") {
    const row = new MessageActionRow().addComponents(
      new MessageSelectMenu()
        .setCustomId("select")
        .setPlaceholder("Nothing selected")
        .addOptions([
          {
            label: "Machine Learning",
            description: "This is a description",
            value: "ML",
          },
          {
            label: "Computer Vision",
            description: "This is also a description",
            value: "CV",
          },
          {
            label: "Robotics",
            description: "This is also a description",
            value: "RO",
          },
          // {
          //     label: 'Natural Language Processing',
          //     description: 'This is also a description',
          //     value: 'NLP',
          // },

          //    {
          //         label: 'Speech Processing',
          //         description: 'This is also a description',
          //         value: 'SP',
          //    }
        ])
    );
    message.reply({ content: "Here's a list of roles:", components: [row] });

    client.on("interactionCreate", async (interaction) => {
      if (!interaction.isSelectMenu()) return;

      const sub = interaction.values[0];
      if (sub === "ML") {
        //check if already has role ML
        if (
          message.member.roles.cache.find(
            (role) => role.name === "Machine Learning"
          )
        ) {
          interaction
            .update({
              content: "You already have the Machine Learning Role!",
              components: [],
              ephemeral: true,
            })
            .then()
            .catch(console.error);
        } else {
          //add role ML
          message.member.roles.add(
            message.guild.roles.cache.find(
              (role) => role.name === "Machine Learning"
            )
          );
          interaction
            .update({
              content:
                "Congrats!\n You have been added to the Machine Learning Role!",
              components: [],
              ephemeral: true,
            })
            .then()
            .catch(console.error);
        }
      } else if (sub === "CV") {
        //check if already has role CV
        if (
          message.member.roles.cache.find(
            (role) => role.name === "Computer Vision"
          )
        ) {
          interaction
            .update({
              content: "You already have the Computer Vision role!",
              components: [],
              ephemeral: true,
            })
            .then()
            .catch(console.error);
        } else {
          //add role CV
          message.member.roles.add(
            message.guild.roles.cache.find(
              (role) => role.name === "Computer Vision"
            )
          );
          interaction
            .update({
              content:
                "Congrats!\n You have been added to the Computer Vision Role!",
              components: [],
              ephemeral: true,
            })
            .then()
            .catch(console.error);
        }
      } else if (sub === "RO") {
        //check if already has role RO
        if (
          message.member.roles.cache.find((role) => role.name === "Robotics")
        ) {
          interaction
            .update({
              content: "You already have the Robotics Role!",
              components: [],
              ephemeral: true,
            })
            .then()
            .catch(console.error);
        } else {
          //add role RO
          message.member.roles.add(
            message.guild.roles.cache.find((role) => role.name === "Robotics")
          );
          interaction
            .update({
              content: "Congrats!\n You have been added to the Robotics Role!",
              components: [],
              ephemeral: true,
            })
            .then()
            .catch(console.error);
        }
      }
    });
  } else if (command === "domains") {
    const row = new MessageActionRow().addComponents(
      new MessageSelectMenu()
        .setCustomId("select")
        .setPlaceholder("Nothing selected")
        .addOptions([
          {
            label: "Machine Learning",
            description: "This is a description",
            value: "ML",
          },
          {
            label: "Computer Vision",
            description: "This is also a description",
            value: "CV",
          },
          {
            label: "Robotics",
            description: "This is also a description",
            value: "RO",
          },
          // {
          //     label: 'Natural Language Processing',
          //     description: 'This is also a description',
          //     value: 'NLP',
          // },

          //    {
          //         label: 'Speech Processing',
          //         description: 'This is also a description',
          //         value: 'SP',
          //    }
        ])
    );

    message.reply({ content: "Here's a list of domains:", components: [row] });

    client.on("interactionCreate", async (interaction) => {
      if (!interaction.isSelectMenu()) return;
      // console.log(interaction)
      //get elements from doc if sub is equal to interaction.values[0]
      const sub = interaction.values[0];
      const sub_list = doc.filter(function (conference) {
        return conference.sub === sub;
      });
      conference_embed = new MessageEmbed()
        .setColor(colors[Math.floor(Math.random() * colors.length)])
        .setTitle(domains[sub][0])
        .setDescription("Upcoming Conferences:" + "\n")
        .setThumbnail(domains[sub][1])
        .addFields(
          {
            name:
              "```" +
              sub_list[0].title +
              "```" +
              " held from " +
              sub_list[0].date,
            value: sub_list[0].link,
            inline: false,
          },
          ////  { name: '\u200B', value: '\u200B' },
          {
            name:
              "```" +
              sub_list[1].title +
              "```" +
              " held from " +
              sub_list[1].date,
            value: sub_list[1].link,
            inline: false,
          }
        );

      //Here there's an error, and i don't know why it occurs, but catching it stops the program from crashing
      interaction
        .update({
          content: "Here's what I found",
          embeds: [conference_embed],
          components: [],
          ephemeral: true,
        })
        .then()
        .catch(console.error);
    });
  } else if (command === "conferences") {
    // inside a command, event listener, etc.
    const embed = new MessageEmbed()
      .setColor("#8c52ff")
      .setTitle("Upcoming Conferences")
      .setDescription("These are 5 upcoming conferences")
      .setThumbnail("https://i.imgur.com/eBiE8DT.png")
      .addFields(
        {
          name: "```" + doc[0].title + "```" + " held from " + doc[0].date,
          value: doc[0].link,
          inline: false,
        },
        ////  { name: '\u200B', value: '\u200B' },
        {
          name: "```" + doc[1].title + "```" + " held from " + doc[1].date,
          value: doc[1].link,
          inline: false,
        },
        ////  { name: '\u200B', value: '\u200B' },
        {
          name: "```" + doc[2].title + "```" + " held from " + doc[2].date,
          value: doc[2].link,
          inline: false,
        },
        ////  { name: '\u200B', value: '\u200B' },
        {
          name: "```" + doc[3].title + "```" + " held from " + doc[3].date,
          value: doc[3].link,
          inline: false,
        },
        ////  { name: '\u200B', value: '\u200B' },
        {
          name: "```" + doc[4].title + "```" + " held from " + doc[4].date,
          value: doc[4].link,
          inline: false,
        }
        ////  { name: '\u200B', value: '\u200B' },
      )
      .setTimestamp()
      .setFooter({
        text: "Research et Al",
        iconURL: "https://i.imgur.com/eBiE8DT.png",
      });

    channel.send({ embeds: [embed] });
  } else if (command === "instagram") {
    const embed = new MessageEmbed()
      .setColor("#8c52ff")
      .setTitle("Instagram")
      .setDescription("This is the link to our Instagram page")
      .setThumbnail(
        "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Instagram_icon.png/1024px-Instagram_icon.png"
      )
      .addFields({
        name: "Link",
        value: "https://www.instagram.com/research_et_al/",
        inline: false,
      })
      .setTimestamp()
      .setFooter({
        text: "Research et Al",
        iconURL: "https://i.imgur.com/eBiE8DT.png",
      });
    channel.send({ embeds: [embed] });
  } else if (command === "github") {
    const embed = new MessageEmbed()
      .setColor("#8c52ff")
      .setTitle("Github")
      .setDescription("This is the link to our Github page")
      .setThumbnail(
        "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png"
      )
      .addFields({
        name: "Link",
        value: "https://github.com/Research-Et-Al",
        inline: false,
      })
      .setTimestamp()
      .setFooter({
        text: "Research et Al",
        iconURL: "https://i.imgur.com/eBiE8DT.png",
      });
    channel.send({ embeds: [embed] });
  } else if (command === "linkedin") {
    const embed = new MessageEmbed()
      .setColor("#8c52ff")
      .setTitle("Linkedin")
      .setDescription("This is the link to our Linkedin page")
      .setThumbnail("https://cdn-icons-png.flaticon.com/512/174/174857.png")
      .addFields({
        name: "Link",
        value: "https://www.linkedin.com/company/pesu-research-et-al/",
        inline: false,
      })
      .setTimestamp()
      .setFooter({
        text: "Research et Al",
        iconURL: "https://i.imgur.com/eBiE8DT.png",
      });
    channel.send({ embeds: [embed] });
  } else if (command === "hot" || command === "🔥") {
    //Have to add links to each of these
    if (loaded) {
      const embed = new MessageEmbed()
        .setColor("#8c52ff")
        .setTitle("**" + "Hot Research on Social Media" + "**")
        .setDescription("These are the top 5 🔥 papers on social media")
        .setThumbnail("https://i.imgur.com/eBiE8DT.png")
        .addFields(
          {
            name: "```" + top_5_social_papers[0][0] + "```",
            value: top_5_social_papers[0][2],
            inline: false,
          },
          {
            name: "Link",
            value:
              "[Click Here to go to the website](" +
              top_5_social_papers[0].at(-1) +
              ")",
            inline: false,
          },
          //  { name: '\u200B', value: '\u200B' },
          {
            name: "```" + top_5_social_papers[1][0] + "```",
            value: top_5_social_papers[1][2],
            inline: false,
          },
          {
            name: "Link",
            value:
              "[Click Here to go to the website](" +
              top_5_social_papers[1].at(-1) +
              ")",
            inline: false,
          },
          //  { name: '\u200B', value: '\u200B' },
          {
            name: "```" + top_5_social_papers[2][0] + "```",
            value: top_5_social_papers[2][2],
            inline: false,
          },
          {
            name: "Link",
            value:
              "[Click Here to go to the website](" +
              top_5_social_papers[2].at(-1) +
              ")",
            inline: false,
          },
          //  { name: '\u200B', value: '\u200B' },
          {
            name: "```" + top_5_social_papers[3][0] + "```",
            value: top_5_social_papers[3][2],
            inline: false,
          },
          {
            name: "Link",
            value:
              "[Click Here to go to the website](" +
              top_5_social_papers[3].at(-1) +
              ")",
            inline: false,
          },
          //  { name: '\u200B', value: '\u200B' },
          {
            name: "```" + top_5_social_papers[4][0] + "```",
            value: top_5_social_papers[4][2],
            inline: false,
          },
          {
            name: "Link",
            value:
              "[Click Here to go to the website](" +
              top_5_social_papers[4].at(-1) +
              ")",
            inline: false,
          }
          //  { name: '\u200B', value: '\u200B' },
        )
        .setTimestamp()
        .setFooter({
          text: "Research et Al",
          iconURL: "https://i.imgur.com/eBiE8DT.png",
        });

      channel.send({ embeds: [embed] });
    } else {
      channel.send("Loading...");
    }
  } else if (command === "new" || command === "latest") {
    if (loaded) {
      const embed = new MessageEmbed()
        .setColor("#8c52ff")
        .setTitle("**" + "Latest Research Papers" + "**")
        .setDescription("These are the top 5 newest papers")
        .setThumbnail("https://i.imgur.com/eBiE8DT.png")
        .addFields(
          {
            name: "```" + top_5_latest_papers[0][0] + "```",
            value: top_5_latest_papers[0][2],
            inline: false,
          },
          {
            name: "Link",
            value:
              "[Click Here to go to the website](" +
              top_5_latest_papers[0].at(-1) +
              ")",
            inline: false,
          },
          //  { name: '\u200B', value: '\u200B' },
          {
            name: "```" + top_5_latest_papers[1][0] + "```",
            value: top_5_latest_papers[1][2],
            inline: false,
          },
          {
            name: "Link",
            value:
              "[Click Here to go to the website](" +
              top_5_latest_papers[1].at(-1) +
              ")",
            inline: false,
          },
          //  { name: '\u200B', value: '\u200B' },
          {
            name: "```" + top_5_latest_papers[2][0] + "```",
            value: top_5_latest_papers[2][2],
            inline: false,
          },
          {
            name: "Link",
            value:
              "[Click Here to go to the website](" +
              top_5_latest_papers[2].at(-1) +
              ")",
            inline: false,
          },
          //  { name: '\u200B', value: '\u200B' },
          {
            name: "```" + top_5_latest_papers[3][0] + "```",
            value: top_5_latest_papers[3][2],
            inline: false,
          },
          {
            name: "Link",
            value:
              "[Click Here to go to the website](" +
              top_5_latest_papers[3].at(-1) +
              ")",
            inline: false,
          },
          //  { name: '\u200B', value: '\u200B' },
          {
            name: "```" + top_5_latest_papers[4][0] + "```",
            value: top_5_latest_papers[4][2],
            inline: false,
          },
          {
            name: "Link",
            value:
              "[Click Here to go to the website](" +
              top_5_latest_papers[4].at(-1) +
              ")",
            inline: false,
          }
          //  { name: '\u200B', value: '\u200B' },
        )
        .setTimestamp()
        .setFooter({
          text: "Research et Al",
          iconURL: "https://i.imgur.com/eBiE8DT.png",
        });

      channel.send({ embeds: [embed] });
    } else {
      channel.send("Loading...");
    }
  } else if (command === "greatest" || command === "goat" || command === "🐐") {
    //Have to add links to each of these
    if (loaded) {
      const embed = new MessageEmbed()
        .setColor("#8c52ff")
        .setTitle("**" + "Greatest Research Papers" + "**")
        .setDescription("These are the top 5 greatest papers 🐐")
        .setThumbnail("https://i.imgur.com/eBiE8DT.png")
        .addFields(
          {
            name: "```" + top_5_greatest_papers[0][0] + "```",
            value: top_5_greatest_papers[0][2],
            inline: false,
          },
          {
            name: "Link",
            value:
              "[Click Here to go to the website](" +
              top_5_greatest_papers[0].at(-1) +
              ")",
            inline: false,
          },
          //  { name: '\u200B', value: '\u200B' },
          {
            name: "```" + top_5_greatest_papers[1][0] + "```",
            value: top_5_greatest_papers[1][2],
            inline: false,
          },
          {
            name: "Link",
            value:
              "[Click Here to go to the website](" +
              top_5_greatest_papers[1].at(-1) +
              ")",
            inline: false,
          },
          //  { name: '\u200B', value: '\u200B' },
          {
            name: "```" + top_5_greatest_papers[2][0] + "```",
            value: top_5_greatest_papers[2][2],
            inline: false,
          },
          {
            name: "Link",
            value:
              "[Click Here to go to the website](" +
              top_5_greatest_papers[2].at(-1) +
              ")",
            inline: false,
          },
          //  { name: '\u200B', value: '\u200B' },
          {
            name: "```" + top_5_greatest_papers[3][0] + "```",
            value: top_5_greatest_papers[3][2],
            inline: false,
          },
          {
            name: "Link",
            value:
              "[Click Here to go to the website](" +
              top_5_greatest_papers[3].at(-1) +
              ")",
            inline: false,
          },
          //  { name: '\u200B', value: '\u200B' },
          {
            name: "```" + top_5_greatest_papers[4][0] + "```",
            value: top_5_greatest_papers[4][2],
            inline: false,
          },
          {
            name: "Link",
            value:
              "[Click Here to go to the website](" +
              top_5_greatest_papers[4].at(-1) +
              ")",
            inline: false,
          }
          //  { name: '\u200B', value: '\u200B' },
        )
        .setTimestamp()
        .setFooter({
          text: "Research et Al",
          iconURL: "https://i.imgur.com/eBiE8DT.png",
        });

      channel.send({ embeds: [embed] });
    } else {
      channel.send("Loading...");
    }
  } else if (command === "trending") {
    //Have to add links to each of these
    if (loaded) {
      const embed = new MessageEmbed()
        .setColor("#8c52ff")
        .setTitle("**" + "Trending Research Papers" + "**")
        .setDescription("These are the top 5 trending papers")
        .setThumbnail("https://i.imgur.com/eBiE8DT.png")
        .addFields(
          {
            name: "```" + top_5_trending_papers[0][0] + "```",
            value: top_5_trending_papers[0][2],
            inline: false,
          },
          {
            name: "Link",
            value:
              "[Click Here to go to the website](" +
              top_5_trending_papers[0].at(-1) +
              ")",
            inline: false,
          },
          //  { name: '\u200B', value: '\u200B' },
          {
            name: "```" + top_5_trending_papers[1][0] + "```",
            value: top_5_trending_papers[1][2],
            inline: false,
          },
          {
            name: "Link",
            value:
              "[Click Here to go to the website](" +
              top_5_trending_papers[1].at(-1) +
              ")",
            inline: false,
          },
          //  { name: '\u200B', value: '\u200B' },
          {
            name: "```" + top_5_trending_papers[2][0] + "```",
            value: top_5_trending_papers[2][2],
            inline: false,
          },
          {
            name: "Link",
            value:
              "[Click Here to go to the website](" +
              top_5_trending_papers[2].at(-1) +
              ")",
            inline: false,
          },
          //  { name: '\u200B', value: '\u200B' },
          {
            name: "```" + top_5_trending_papers[3][0] + "```",
            value: top_5_trending_papers[3][2],
            inline: false,
          },
          {
            name: "Link",
            value:
              "[Click Here to go to the website](" +
              top_5_trending_papers[3].at(-1) +
              ")",
            inline: false,
          },
          //  { name: '\u200B', value: '\u200B' },
          {
            name: "```" + top_5_trending_papers[4][0] + "```",
            value: top_5_trending_papers[4][2],
            inline: false,
          },
          {
            name: "Link",
            value:
              "[Click Here to go to the website](" +
              top_5_trending_papers[4].at(-1) +
              ")",
            inline: false,
          }
          //  { name: '\u200B', value: '\u200B' },
        )
        .setTimestamp()
        .setFooter({
          text: "Research et Al",
          iconURL: "https://i.imgur.com/eBiE8DT.png",
        });

      channel.send({ embeds: [embed] });
    } else {
      channel.send("Loading...");
    }
  } else if (command === "potd") {
    chosen_paper = latest_papers[(latest_papers.length * Math.random()) | 0];
    write_object = {
      title: chosen_paper[0],
      link: chosen_paper.at(-1),
      description: chosen_paper[2],
      date: new Date().toLocaleDateString("en-US"),
    };

    update_paper_of_the_day(write_object, message.channel.id);
  } else if (command === "help") {
    const embed = new MessageEmbed()
      .setColor("#8c52ff")
      .setTitle("**" + "Help" + "**")
      .setDescription("These are the commands you can use")
      .setThumbnail("https://i.imgur.com/HSUAWtg.png")
      .addFields(
        // { name: "\u200B", value: "\u200B" },
        {
          name: "**" + "Research Papers" + "**",
          value: "Commands related to research papers",
          inline: false,
        },
        {
          name: "```new or latest``` ",
          value: "See the top 5 latest research papers",
          inline: false,
        },
        {
          name: "```trending```",
          value: "See the top 5 trending research papers",
          inline: false,
        },
        {
          name: "```hot or 🔥```",
          value: "See the top 5 hot research papers on social media",
          inline: false,
        },
        {
          name: "```greatest or goat or 🐐```",
          value: "See the top 5 greatest research papers of all time",
          inline: false,
        },
        {
          name: "```potd```",
          value: "See the Paper of the Day",
          inline: false,
        },
        {
          name: "```save```",
          value: "Save the Paper of the Day to read later",
          inline: false,
        },
        { name: "```saved```", value: "See all saved papers", inline: false },
        {
          name: "```remove [number]```",
          value: "Remove the saved paper at the given number",
          inline: false,
        },
        // { name: "\u200B", value: "\u200B" },
        {
          name: "**" + "Conferences" + "**",
          value: "Commands related to conferences",
          inline: false,
        },
        {
          name: "```domains```",
          value: "See two upcoming conferences for a domain",
          inline: false,
        },
        {
          name: "```conferences```",
          value: "See five upcoming conferences",
          inline: false,
        },
        // { name: "\u200B", value: "\u200B" },
        {
          name: "**" + "Social Media" + "**",
          value: "Social media details",
          inline: false,
        },
        {
          name: "```linkedin```",
          value: "Get the LinkedIn profile of Research et Al",
          inline: false,
        },
        {
          name: "```github```",
          value: "Get the GitHub profile of Research et Al",
          inline: false,
        },
        {
          name: "```instagram```",
          value: "Get the Instagram profile of Research et Al",
          inline: false,
        },
        // { name: "\u200B", value: "\u200B" },
        { name: "**" + "Other" + "**", value: "Other commands", inline: false },
        {
          name: "```kanye```",
          value: "Gives you a Kanye West quote",
          inline: false,
        },
        {
          name: "```fact```",
          value: "Gives you a fact",
          inline: false,
        },
        {
          name: "```excuse```",
          value: "Gives you an excuse to use ;)",
          inline: false,
        },
        {
          name: "```upcoming```",
          value: "See Upcoming Events!",
          inline: false,
        },
        { name: "```roles```", value: "Choose a role", inline: false },
        {
          name: "```aim or purpose ```",
          value: "Wondering what we do at Research et Al?\n Find out here",
          inline: false,
        },
        {
          name: "```wyd or sup or wassup```",
          value: "Tells you what I'm doing",
          inline: false,
        },
        { name: "```help```", value: "Gives you this message", inline: false }
      )
      .setTimestamp()
      .setFooter({
        text: "Research et Al",
        iconURL: "https://i.imgur.com/eBiE8DT.png",
      });

    channel.send({ embeds: [embed] });
  } else if (command === "aim" || command === "purpose") {
    const embed = new MessageEmbed()
      .setColor("#8c52ff")
      .setTitle("Purpose")
      .setImage("https://i.imgur.com/4vqmuXq.jpg")
      .setTimestamp()
      .setFooter({
        text: "Research et Al",
        iconURL: "https://i.imgur.com/eBiE8DT.png",
      });

    channel.send({ embeds: [embed] });
  } else {
    channel.send("I'm sorry I didn't quite get that. Please try again.");
  }
});

client.login(process.env.BOT_TOKEN);

app.listen(process.env.PORT, function () {
  console.log("The Server is running on port " + process.env.PORT);
});
