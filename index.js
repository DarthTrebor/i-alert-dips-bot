const Discord = require('discord.js');
const cron = require('node-cron');

const {
    prefix,
    token,
} = require('./config.json');

const helpersController = require('./controllers/helpersController');
const musicController = require('./controllers/musicController');
const cryptoController = require('./controllers/cryptoController');
const playlistController = require('./controllers/playlistController');

const client = new Discord.Client();

client.login(token);

client.once('ready', () => {
    console.log('BOT ON');

    cron.schedule('0 0 */1 * * *',  async () => {
        await cryptoController.printDips(client);
    });
});

client.on('message', async message => {
    if(!message.content.startsWith(prefix)) {
        return;
    }
    const args = message.content.split(" ");

    switch(args[0]) {
        case `${prefix}purge`:
            await helpersController.purge(message, args[1]);
            break;
        case `${prefix}play`:
            await musicController.execute(message, args, 0)
            break;
        case `${prefix}dc`:
            await musicController.disconnect(message);
            break;
        case `${prefix}disconnect`:
            await musicController.disconnect(message);
            break;
        case `${prefix}loop`:
            await musicController.loop(message);
            break;
        case `${prefix}shuffle`:
            await musicController.shuffle(message);
            break;
        case `${prefix}skip`:
            await musicController.skip(message);
            break;
        case `${prefix}pause`:
            await musicController.pause(message);
            break;
        case `${prefix}resume`:
            await musicController.resume(message);
            break;
        case `${prefix}mp_add`:
            await playlistController.addToPlaylist(message, args);
            break;
        case `${prefix}mp_play`:
            await playlistController.executePlaylist(message);
            break;
        case `${prefix}mp_shuffle`:
            await playlistController.shufflePlaylist(message);
            break;
    }
})
