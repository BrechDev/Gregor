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
let player = null;
let map = [];

const geturl = async (message) => {
    return new Promise(resolve => {
        if (message.substring(0, 8) == "https://") {
            finalurl = message;
            resolve(finalurl);
            return;
        }
        let url = base_url + message + "&key=" + process.env.YOUTUBE_TOKEN + "&maxResults=1"
        request(url, { json: true }, (err, res, body) => {
            if (err) { return console.log(err); }
            if (body.error) { 
                finalurl = null;
                resolve(finalurl);
                return;
            }
            urlid = body.items[0].id.videoId;
            finalurl = "https://youtube.com/watch?v=".concat(body.items[0].id.videoId);
            resolve(finalurl);
        })
    });
}

const check_queu = async () => {
    if (map.length == 0) {
        if (chanel != null) {
            chanel.destroy();
            chanel = null;
        }
    } else {
        let url = map[0]
        map.shift();
        play_music(url)
        return;
    }
    return;
}

const play_music = async (finalurl) => {
    let stream = ytdl(finalurl, {filter: 'audioonly'});
    let res = createAudioResource(stream, {inputType: StreamType.Arbitrary});
    player = createAudioPlayer();
    player.play(res);
    if (chanel != null) {
        chanel.subscribe(player);
    }
    player.on('error', (err) => {
        console.log(err.message);
    })
    player.on(AudioPlayerStatus.Idle, () => {
        console.log('Idle');
        check_queu();
        return;
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
    if (messageparser[0] == "!gregore") {
        const stream = ytdl("https://youtube.com/watch?v=3k2J7eavWiM", {filter: 'audioonly'});
        const res = createAudioResource(stream, {inputType: StreamType.Arbitrary});

        player.play(res);
        if (chanel != null) {
            chanel.subscribe(player);
        }

        player.on(AudioPlayerStatus.Idle, () => {chanel.destroy();map = []; chanel = null;});
    }
    if (messageparser[0] == "!gregor" && songname != "") {
        await geturl(songname);
        if (finalurl == null) {
            message.reply("No more API call today sorry, use link only please")
            return;
        }
        if (finalurl == "https://youtube.com/watch?v=undefined") {
            message.reply("Try with something more acurate")
            return;
        }
        if (message.member.voice.channel == undefined) {
            message.reply("Your not connected to any channel");
            return;
        }
        if (chanel != null) {
            map.push(finalurl);
            message.reply(map[0]);
            return;
        } else {
            chanel = joinVoiceChannel({
                channelId: message.member.voice.channel.id,
                guildId: message.guild.id,
                adapterCreator: message.guild.voiceAdapterCreator
            })
        }
        message.reply(finalurl);
        console.log("connect to : " + message.member.voice.channel.name);
        play_music(finalurl)
    }
    if (messageparser[0] == "!gregor" && songname == "") {
        message.reply("Try !gregor <Song Name>");
    }
    if (messageparser[0] == "!gregorAuthor") {
        message.reply("Mon createur est un bg sans nom")
    }
    if (messageparser[0] == "!gregorjoin") {
        if (chanel != null) {
            map = [];
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
            map = [];
            chanel = null;
        }
    }
    if (messageparser[0] == "!gregorpause") {
        console.log('Music get paused')
        player.pause();
    }
    if (messageparser[0] == "!gregorplay") {
        console.log('Music get Unpaused')
        player.unpause();
    }
    if (messageparser[0] == "!gregorstop") {
        console.log('Music get Stoped')
        player.stop();
        if (chanel) {
            chanel.destroy();
            map = [];
            chanel = null;
        }
    }
    if (messageparser[0] == "!gregorskip") {
        let url = map[0]
        map.shift()
        play_music(url)
    }
})

bot.login(process.env.DISCORD_CLIENT)