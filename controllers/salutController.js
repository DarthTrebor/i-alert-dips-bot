const hello = async(message) => {
    return message.channel.send('test hello world discord');
}

const one = async(message) => {
    await message.delete();
}

module.exports = {
    hello,
    one
}
