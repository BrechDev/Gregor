require('dotenv').config()
const request = require('request');
const Discord = require('discord.js')
const bot = new Discord.Client({ intents: ['GUILD_MESSAGES', 'DIRECT_MESSAGES','GUILDS']})
const base_url= "https://www.googleapis.com/youtube/v3/search?part=snippet&q="
let finalurl = "Freeze Rael";

const geturl = async (message) => {
    return new Promise(resolve => {
        let url = base_url + message + "&key=" + process.env.YOUTUBE_TOKEN + "&maxResults=1"
        console.log(url);
        request(url, { json: true }, (err, res, body) => {
            if (err) { return console.log(err); }
            console.log(body.items[0].id.videoId);
            finalurl = "https://youtube.com/watch?v=".concat(body.items[0].id.videoId);
            resolve(finalurl);
        })
    });
}

// async function geturl (message) {
//     let url = base_url + message.content + "&key=AIzaSyAfLaelZYy4HPjPlm9dU6c1IO86h0aLnwU&maxResults=1"
//     request(url, { json: true }, (err, res, body) => {
//         if (err) { return console.log(err); }
//         console.log(body.items[0].id.videoId);
//         finalurl = "https://youtube.com/watch?v=".concat(body.items[0].id.videoId);
//         return finalurl;
//     })
// }

// const geturl = (message) => {
//     let url = base_url + message.content + "&key=AIzaSyAfLaelZYy4HPjPlm9dU6c1IO86h0aLnwU&maxResults=1"
//     request(url, { json: true }, (err, res, body) => {
//         if (err) { return console.log(err); }
//         console.log(body.items[0].id.videoId);
//         finalurl = "https://youtube.com/watch?v=".concat(body.items[0].id.videoId);
//         return finalurl;
//     })
// }

const doSomething = (message) => {
    return new Promise(resolve => {
        setTimeout(() => resolve(message), 3000)
    })
}

bot.on("ready", () => {
    console.log("Je suis connecté !")
})

bot.on("messageCreate", async function(message) {
    console.log(message);
    let messageparser = message.content.split(' ');
    let songname = "";
    console.log(messageparser)
    console.log(messageparser.length)
    for (let i = 1; i < messageparser.length; i++) {
        console.log(i);
        songname = songname.concat(messageparser[i]);
        songname = songname.concat(' ');
    }
    console.log("songname:" + songname);
    if (messageparser[0] == "!gregor" && songname != "") {
        await geturl(songname);
        message.reply(finalurl);
    }
    if (messageparser[0] == "!gregor" && songname == "") {
        message.reply("Try !gregor <Song Name>");
    }
    if (messageparser[0] == "!gregorAuthor") {
        message.reply("Mon createur est un bg sans nom")
    }
})

bot.login(process.env.DISCORD_CLIENT)