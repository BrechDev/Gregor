require('dotenv').config()
const request = require('request');
const Discord = require('discord.js');
const bot = new Discord.Client({ intents: ['GUILD_MESSAGES', 'DIRECT_MESSAGES','GUILDS', 'GUILD_VOICE_STATES'] });
const base_url= "https://www.googleapis.com/youtube/v3/search?part=snippet&q=";
const { joinVoiceChannel } = require('@discordjs/voice');
const { createAudioPlayer, createAudioResource, StreamType, AudioPlayerStatus } = require('@discordjs/voice');
const ytdl = require("ytdl-core");

/////// GLOBAL VARIABLES///////
let finalurl = "";
let chanel = null;
let player = null;
let finalname = "";
let channelname = "";
let name = [];
let map = [];
let loop = false;
let time = 0;
let playing = false;
//////////////////////////////

const geturl = async (message) => {
    return new Promise(resolve => {
        if (message.substring(0, 8) == "https://") {
            finalurl = message;
            resolve(finalurl);
            return;
        }
        let url = base_url + message + "&key=" + process.env.YOUTUBE_TOKEN + "&maxResults=1"
        request(url, { json: true }, (err, body) => {
            if (err) { return console.log(err); }
            if (body.error) { 
                finalurl = null;
                finalname = null;
                channelname = null;
                resolve(finalurl, finalname, channelname);
                return;
            }
            finalname = body.body.items[0].snippet.title;
            channelname = body.body.items[0].snippet.channelTitle;
            finalurl = "https://youtube.com/watch?v=".concat(body.body.items[0].id.videoId);
            resolve(finalurl, finalname, channelname);
        })
    });
}

const check_queu = async (finalurl) => {
    if (loop) {
        play_music(finalurl)
        return;
    }
    if (map.length == 0) {
        time = setTimeout(function() {
            if (chanel != null) {
                chanel.destroy();
                chanel = null;
                map = [];
                name = [];
            }
            loop = false
        }, 120 * 1000);
        map = []
        loop = false
    } else {
        let url = map[0];
        map.shift();
        name.shift();
        play_music(url);
        return;
    }
    return;
}

const play_music = async (finalurl) => {
    playing = true;
    clearTimeout(time);
    if (name.length == 0)
        console.log("Playing: " + finalname);
    else
        console.log("Playing: " + name[0]);
    let stream = ytdl(finalurl, {filter: 'audioonly'});
    let res = createAudioResource(stream, {inputType: StreamType.Arbitrary});
    player = createAudioPlayer();
    player.play(res);
    if (chanel != null) {
        chanel.subscribe(player);
    }
    player.on('error', (err) => {
        playing = false;
        console.log(err.message);
    })
    player.on(AudioPlayerStatus.Idle, () => {
        playing = false;
        check_queu(finalurl);
        return;
    });
}

bot.on("voiceStateUpdate", (oldState, newState) => {
    if (oldState.channelId === null || typeof oldState.channelId == 'undefined') return;
    if (newState.id !== bot.user.id) return;
    loop = false;
    if (newState != oldState) return;
    if (chanel) {
        chanel.destroy();
        map = [];
        name = [];
        chanel = null;
    }
})

bot.on("ready", () => {
    console.log("Je suis connecté !")
    bot.user.setActivity('!gregor | !gregorhelp', { type: 'LISTENING' })
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
    if (messageparser[0] == "!gregorego") {
        if (message.author.id == "320486613090304000") {
            message.reply("Ce mec patisse super bien c'est réel ! (et il est diamant sur LOL, dinguerie)");
        }
        if (message.author.id == "356056142331379722") {
            message.reply("Ce mec a crée ce bot mais quel génie de l'informatique");
        }
    }
    if (messageparser[0] == "!gregordepress") {
        if (message.author.id == "320486613090304000") {
            message.reply("13031707");
        }
        if (message.author.id == "356056142331379722") {
            message.reply("Ce mec pense être un génie de l'informatique mdr alors qu'il a juste créé un bot miteux sur Discord ... DISCORD MDR sort de chez toi non ? Rencontre des vrais gens vas sur Instagram, snap. Des vrais réseaux sociaux bouffon associable + ratio + flop");
        }
    }
    if (messageparser[0] == "!gregot" || messageparser[0] == "!gregoe" || messageparser[0] == "!gregof" || messageparser[0] == "!gregote") {
        message.reply("Ta grand-mère écrit mieux maintenant, c'est !gregor pas ta putain de dyslexie + ratio");
    }
    if (messageparser[0] == "!gregor" && songname != "") {
        if (message.member.voice.channel == undefined) {
            message.reply("Your not connected to any channel");
            return;
        }
        await geturl(songname);
        if (finalurl == null) {
            message.reply("No more API call today sorry, use link only please");
            return;
        }
        if (finalurl == "https://youtube.com/watch?v=undefined") {
            message.reply("Try with something more acurate");
            return;
        }
        if (playing == true) {
            map.push(finalurl);
            name.push(finalname);
            message.reply("Music added to queue : " + map[map.length - 1]);
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
        play_music(finalurl);
    }
    if (messageparser[0] == "!gregoreplay") {
        if (playing == true) {
            message.reply("Currently playing " + finalname + " from " + channelname);
        } else {
            play_music(finalurl);
        }
    }
    if (messageparser[0] == "!gregortitle") {
        message.reply("Currently playing " + finalname + " from " + channelname);
    }
    if (messageparser[0] == "viande") {
        message.author.send("Ahahahhaha d'où t'écrit viande sans raison là, on est où wsh t'es con ou quoi ? + ratio");
    }
    if (messageparser[0] == "ratio") {
        message.react("🇷");
        message.react("🇦");
        message.react("🇹");
        message.react("🇮");
        message.react("🇴");
    }
    if (messageparser[0] == "!gregorhelp") {
        message.reply("Commands List  :\n!gregor title --> Play a song named 'title' with a link or key word\n!gregorstop --> Kick Gregor from the voice room\n!gregorskip --> Go to the next song or skip the current one\n!gregorego --> Command dedicated to the creator and contributors to flatter their egos\nviande --> Easter Egg (in DM)\n!gregorpause --> Pause the current playing music\n!gregorunpause --> Unpause the current playing music\n!gregorloop --> Replay indefinitely the current playing music\n!gregorhelp --> List all gregor's commands");
    }
    if (messageparser[0] == "!gregor" && songname == "") {
        message.reply("Try !gregor <Song Name>");
    }
    if (messageparser[0] == "!gregorpause") {
        console.log('Music get paused');
        player.pause();
    }
    if (messageparser[0] == "!gregorplay") {
        console.log('Music get Unpaused');
        player.unpause();
    }
    if (messageparser[0] == "!gregorstop") {
        console.log('Music get Stoped');
        player.stop();
        if (chanel) {
            chanel.destroy();
            map = [];
            name = [];
            playing = false
            chanel = null;
        }
        loop = false
    }
    if (messageparser[0] == "!gregoreset") {
        loop = false;
        map = [];
        name = [];
    }
    if (messageparser[0] == "!gregorskip") {
        let url = map[0]
        map.shift()
        if (name.length == 1) {name.shift()}
        play_music(url)
    }
    if (messageparser[0] == "!gregorinfo") {
        const channel = message.client.channels.cache.get(message.channelId)
        const embeed = new Discord.MessageEmbed().setColor('#0099FF').setTitle("Les bouffons").setDescription("How can i be homophobic, my bitch is gay").setImage("https://media-exp1.licdn.com/dms/image/C4D03AQG-t8lhrz0lXw/profile-displayphoto-shrink_200_200/0/1610657017248?e=1659571200&v=beta&t=MIWvJlMgkrjbrZTcmRKv0a8NU0sGysFSxsjIo_fK-1c")
        if (channel) {
            channel.send({ embeds: [embeed] });
        }
    }
    // if (messageparser[0] == "!gregorq") {
    //     let mess = "";
    //     for (let i = 0; i < map.length; i++) {
    //         mess = mess.concat(map[i]);
    //     }
    //     if (mess == "") {
    //         message.reply("No song in queue");
    //         return;
    //     }
    //     message.reply(mess);
    //     return;
    // }
    if (messageparser[0] == "!gregorloop") {
        if (chanel == null) {
            message.reply("No music playing right now");
            return;
        }
        loop = !loop;
        message.reply("Loop is : " + (loop ? 'on' : 'off'));
        return;
    }
})

bot.login(process.env.DISCORD_CLIENT)