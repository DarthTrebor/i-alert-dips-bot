const YouTube = require("discord-youtube-api");
const youtube = new YouTube("AIzaSyAzafGBPca0rEX1gvYUuBnDvjEopbq_g80");

const YTBGetVideo = async(message, args) => {
    try {
        const song = await youtube.getVideo(args);
        return song;
    } catch(err) {
        message.channel.send(`:x: **Something broke when playing the song.**`);
    }
};

const YTBSearchVideos = async(message, args) => {
    try {
        const song = await youtube.searchVideos(args);
        return song;
    } catch(err) {
        message.channel.send(`:x: **Something broke when searching the song.**`);
    }
}

const YTBGetPlaylist = async(message, args) => {
    try {
        const playlist = await youtube.getPlaylist(args);
        return playlist;
    } catch(err) {
        message.channel.send(':x: **Something broke when getting the playlist.**');
    }
}

module.exports = {
    YTBSearchVideos,
    YTBGetVideo,
    YTBGetPlaylist
}