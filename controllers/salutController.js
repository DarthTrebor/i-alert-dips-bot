const hello = async(message) => {
    return message.channel.send('muie coaie');
}

const one = async(message) => {
    await message.delete();
}

module.exports = {
    hello,
    one
}