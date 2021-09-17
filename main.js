require('dotenv').config()
const request = require('request');
const Discord = require('discord.js');
const bot = new Discord.Client({ intents: ['GUILD_MESSAGES', 'DIRECT_MESSAGES','GUILDS']});
const base_url= "https://www.googleapis.com/youtube/v3/search?part=snippet&q=";
const { joinVoiceChannel } = require('@discordjs/voice');
let finalurl = "Freeze Rael";
let chanel = null;

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

bot.on("ready", () => {
    console.log("Je suis connecté !")
    bot.user.setActivity('!gregor', { type: 'LISTENING' })
})

bot.on("messageCreate", async function(message) {
    let messageparser = message.content.split(' ');
    let songname = "";
    for (let i = 1; i < messageparser.length; i++) {
        songname = songname.concat(messageparser[i]);
        if (i != messageparser.length - 1) {
            songname = songname.concat(' ');
        }
    }
    if (messageparser[0] == "!gregor" && songname != "") {
        await geturl(songname);
        if (finalurl == "https://youtube.com/watch?v=undefined") {
            message.reply("Try with something more acurate")
            return;
        }
        message.reply(finalurl);
        return;
    }
    if (messageparser[0] == "!gregor" && songname == "") {
        message.reply("Try !gregor <Song Name>");
    }
    if (messageparser[0] == "!gregorAuthor") {
        message.reply("Mon createur est un bg sans nom")
    }
    if (messageparser[0] == "!gregorjoin") {
        if (chanel != null) {
            chanel.destroy();
            chanel = null;
        }
        if (message.member.voice.channel == undefined) {
            message.reply("Your not connected to any channel");
            return;
        }
        console.log("connect to : " + message.member.voice.channel.name);
        chanel = joinVoiceChannel({
            channelId: message.member.voice.channel.id,
            guildId: message.guild.id,
            adapterCreator: message.guild.voiceAdapterCreator
        })
    }
    if (messageparser[0] == "!gregortej") {
        if (chanel) {
            chanel.destroy();
            chanel = null;
        }
    }
})

bot.login(process.env.DISCORD_CLIENT)