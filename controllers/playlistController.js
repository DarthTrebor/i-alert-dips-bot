const Discord = require("discord.js");
const execute = require('./musicController').execute;
const YTBGetVideo = require('./YoutubeAPI').YTBGetVideo;

const myPlaylist = [];

const executePlaylist = async(message) => {
    if(message.author.id === "742668468192673853")
        await execute(message, myPlaylist, 1);
}

const addToPlaylist = async (message, args) => {
    if(message.author.id !== "742668468192673853") {
        return message.channel.send(':exclamation: This command can be used only by the admin!');
    }
    const song = await YTBGetVideo(message, args[1]);
    myPlaylist.push(song);

    const embed = new Discord.MessageEmbed()
        .setColor('#00ff00')
        .setTitle(song.title)
        .setURL(song.url)
        .setAuthor('PlayList | David - Added to queue', `https://cdn.discordapp.com/avatars/${message.author.id}/${message.author.avatar}.png?size=256)`)
        .setThumbnail(`https://i.ytimg.com/vi/${song.id}/hqdefault.jpg?`)
        .setFooter(`Queue - Number ${myPlaylist.length - 1}`)
    return message.channel.send(embed);
}

const shufflePlaylist = async (message) => {
    if(message.author.id !== "742668468192673853") {
        return message.channel.send(':exclamation: This command can be used only by the admin!');
    }
    myPlaylist.sort((a, b) => 0.5 - Math.random())
    return message.channel.send(':twisted_rightwards_arrows:  shuffled!');
}

module.exports = {
    executePlaylist,
    addToPlaylist,
    shufflePlaylist
}