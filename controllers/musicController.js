const ytdl = require('ytdl-core-discord');
const Discord = require("discord.js");

const queue = new Map();

const {
    YTBGetVideo,
    YTBSearchVideos,
    YTBGetPlaylist
} = require('./YoutubeAPI');

const hasServerInfo = async(message) => {
    const serverInfo = queue.get(message.guild.id);
    if(!serverInfo) {
        message.channel.send(":x: **You don't share a connection with the bot yet!**");
        return false;
    }
    return true;
}

const loadPlaylist = async(message, args) => {
    const result = [];
    for(let i = 0; i < args.length; ++i) {
        result.push({
            title: args[i].title,
            url: `https://www.youtube.com/watch?v=${args[i].id}`,
            id: args[i].id,
        })
    }
    return result;
}

const pause = async (message) => {
    if(!await hasServerInfo(message)) return;

    const serverInfo = queue.get(message.guild.id);
    serverInfo.connection.dispatcher.pause();
    message.channel.send(':pause_button: pause!');
}

const resume = async (message) => {
    if(!await hasServerInfo(message)) return;

    const serverInfo = queue.get(message.guild.id);
    serverInfo.connection.dispatcher.resume();
    message.channel.send(':play_pause: resume!');
}

const loop = async (message) => {
    if(!await hasServerInfo(message)) return;

    const serverInfo = queue.get(message.guild.id);
    serverInfo['loop'] = (!serverInfo['loop']);
    queue.set(message.guild.id, serverInfo);
    message.channel.send(`:repeat: **Loop is now ${serverInfo['loop'] ? 'on' : 'off' }!**`);
}

const play = async(message, song) => {
    if(!await hasServerInfo(message)) return;

    const serverInfo = queue.get(message.guild.id);
    if(!serverInfo.songs.length) {
        queue.delete(message.guild.id);
        serverInfo.voiceChannel.leave();
        return;
    }
    const dispatcher = serverInfo.connection
        .play(await ytdl(song.url), { type: 'opus' })
        .on("finish", () => {
            serverInfo.songs.shift();
            if(serverInfo['loop'] === true) {
                serverInfo.songs.push(song);
            }
            if(serverInfo.songs.length !== 0) {
                play(message, serverInfo.songs[0]);
            } else {
                serverInfo.voiceChannel.leave();
                queue.delete(message.guild.id);
            }
        })
        .on("error", error => console.log(error));
}

const getSong = async(message, args) => {
    const query = args.join(' ').replace("$play ", "");
    const result = [];
    if (query.includes("https://www.youtube.com/watch?v=")) {
        const info = await YTBGetVideo(message, query);
        result.push({
            title: info.title,
            url: `https://www.youtube.com/watch?v=${info.id}`,
            id: info.id,
        })
    }
    if (query.includes("https://www.youtube.com/playlist?list=")) {
        const res = await YTBGetPlaylist(message, query);
        for (let i = 0; i < res.length; i++) {
            result.push({
                title: res[i].title,
                url: `https://www.youtube.com/watch?v=${res[i].id}`,
                id: res[i].id,
            })
        }
    } else {
        const ans = await YTBSearchVideos(message, query);
        result.push({
            title: ans.title,
            url: `https://www.youtube.com/watch?v=${ans.id}`,
            id: ans.id,
        });
    }
    return result;
}

const disconnect = async(message) => {
    if(!await hasServerInfo(message)) return;

    const serverInfo = queue.get(message.guild.id);
    if(!serverInfo || !serverInfo.voiceChannel) {
        return message.channel.send(':x: the bot is not in a channel!');
    }
    serverInfo.voiceChannel.leave();
    queue.delete(message.guild.id);
    return message.channel.send(':innocent: Goodbye! I hope you enjoyed!');
}

const skip = async (message) => {
    if(!await hasServerInfo(message)) return;

    const serverInfo = queue.get(message.guild.id);
    if(!serverInfo.songs) {
        return message.channel.send("You can't skip an empty queue!");
    }
    serverInfo.connection.dispatcher.end();
    if(serverInfo.songs[1]) return message.channel.send(":fast_forward: Now listening to " + "``" + serverInfo.songs[1].title +  "``");
}

const execute = async(message, args, type /* 1-admin playlist | 0-requested by user */) => {
    const result = type === 1? await loadPlaylist(message, args) : await getSong(message, args, type);

    const voiceChannel = message.member.voice.channel;
    if(!voiceChannel) return message.reply(':exclamation: You must be in a voice channel to play music!');

    let serverInfo = queue.get(message.guild.id);

    if(!serverInfo) {
        serverInfo = {
            songs: [],
            voiceChannel: voiceChannel,
            volume: 1,
            loop: false,
            connection: null,
            playing: false
        }
    } else {
        if(serverInfo.songs && !serverInfo.connection.dispatcher) {
            serverInfo = {
                songs: [],
                voiceChannel: voiceChannel,
                volume: 1,
                loop: false,
                connection: null,
                playing: false
            }
            queue.delete(message.guild.id);
        }
    }
    try {
        for(let i = 0; i < result.length; i++) {
            serverInfo.songs.push(result[i]);
        }
        serverInfo.connection = await voiceChannel.join();
    } catch(err) {
        console.log(err);
        return;
    }
    if(serverInfo.songs.length && !serverInfo.connection.dispatcher) {
        queue.set(message.guild.id, serverInfo);
        await play(message, result[0]);
        message.channel.send(":notes: Now listening to " + "" + result[0].title +  "");
    } else if(serverInfo.connection.dispatcher) {
        const exampleEmbed = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setTitle(result[0].title)
            .setURL(result[0].url)
            .setAuthor('Added to queue', `https://cdn.discordapp.com/avatars/${message.author.id}/${message.author.avatar}.png?size=256)`)
            .setThumbnail(`https://i.ytimg.com/vi/${result[0].id}/hqdefault.jpg?`)
            .setFooter(`Queue - Number ${serverInfo.songs.length - 1}`)
        queue.set(message.guild.id, serverInfo);
        message.channel.send(exampleEmbed);
    }
}

const shuffle = async(message) => {
    if(!await hasServerInfo(message)) return;

    const serverInfo = queue.get(message.guild.id);
    serverInfo.songs.sort((a, b) => 0.5 - Math.random())
    queue.set(message.guild.id, serverInfo);
    return message.channel.send(':twisted_rightwards_arrows: shuffled!');
}

module.exports = {
    execute,
    loop,
    skip,
    disconnect,
    resume,
    pause,
    shuffle
}