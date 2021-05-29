const purge = async(message, length) => {
    if(length <= 1 || length > 100) {
        return message.channel.send(":x: You can only delete between 2-100 messages!");
    }
    message.channel.bulkDelete(++length).then( () => {
        return message.channel.send(`**${length - 1}** messages deleted!`).then(msg => msg.delete({ timeout: 3000 }));
    }).catch((err) => {
        return message.channel.send("Something broke! We couldn't find messages to delete").then(msg => msg.delete({ timeout: 3000}));
    })
}

module.exports = {
    purge
}