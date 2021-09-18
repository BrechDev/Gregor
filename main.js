require('dotenv').config()
const request = require('request');
const Discord = require('discord.js');
const bot = new Discord.Client({ intents: ['GUILD_MESSAGES', 'DIRECT_MESSAGES','GUILDS', 'GUILD_VOICE_STATES']});
const base_url= "https://www.googleapis.com/youtube/v3/search?part=snippet&q=";
const { joinVoiceChannel } = require('@discordjs/voice');
const { createAudioPlayer, createAudioResource, StreamType, AudioPlayerStatus } = require('@discordjs/voice');
const ytdl = require("ytdl-core");
let finalurl = "Freeze Rael";
let urlid = "1";
let chanel = null;
let player = createAudioPlayer();

const geturl = async (message) => {
    return new Promise(resolve => {
        console.log("message:" + message);
        if (message.substring(0, 32) == "https://www.youtube.com/watch?v=") {
            finalurl = message;
            console.log("pas de quota");
            resolve(finalurl);
            return;
        }
        let url = base_url + message + "&key=" + process.env.YOUTUBE_TOKEN + "&maxResults=1"
        console.log(url);
        request(url, { json: true }, (err, res, body) => {
            console.log("100 quotas en moins");
            if (err) { return console.log(err); }
            console.log(body.items[0].id.videoId);
            urlid = body.items[0].id.videoId;
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
    console.log("https://www.youtube.com/watch?v=3k2J7eavWiM".substring(0, 28));
    if (messageparser[0] == "!gregore") {
        const stream = ytdl("https://youtube.com/watch?v=3k2J7eavWiM", {filter: 'audioonly'});
        const res = createAudioResource(stream, {inputType: StreamType.Arbitrary});

        player.play(res);
        chanel.subscribe(player);

        player.on(AudioPlayerStatus.Idle, () => {chanel.destroy(); chanel = null;});
    }
    if (messageparser[0] == "!gregor" && songname != "") {
        await geturl(songname);
        if (finalurl == "https://youtube.com/watch?v=undefined") {
            message.reply("Try with something more acurate")
            return;
        }
        message.reply(finalurl);
        if (message.member.voice.channel == undefined) {
            message.reply("Your not connected to any channel");
            return;
        }
        if (chanel != null) {
            chanel.destroy();
            chanel = null;
        } else {
            chanel = joinVoiceChannel({
                channelId: message.member.voice.channel.id,
                guildId: message.guild.id,
                adapterCreator: message.guild.voiceAdapterCreator
            })
        }
        console.log("connect to : " + message.member.voice.channel.name);
        let stream = ytdl(finalurl, {filter: 'audioonly'});
        let res = createAudioResource(stream, {inputType: StreamType.Arbitrary});
        let player = createAudioPlayer();

        player.play(res);
        chanel.subscribe(player);

        player.on(AudioPlayerStatus.Idle, () => {chanel.destroy(); chanel = null;});
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
    if (messageparser[0] == "!gregstop") {
        player.stop();
    }
})

bot.login(process.env.DISCORD_CLIENT)