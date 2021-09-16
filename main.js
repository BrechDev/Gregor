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
    let messageparser = message.content.split(' ');
    if (messageparser[0] == "!gregor" && messageparser[1] != "") {
        await geturl(messageparser[1]);
        message.reply(finalurl);
    }
})

bot.login(process.env.DISCORD_CLIENT)