const axios = require('axios');
const cryptoCoins = [
    'BTC', 'ETH', 'LTC', 'USDT', 'BNB', 'ADA', 'XRP', 'DOGE', 'DOT', 'USDC', 'ICP', 'UNI',
    'BCH', 'MATIC', 'LTC', 'LINK', 'XLM', 'SOL', 'ETC', 'BUSD', 'VET', 'THETA', 'WBTC', 'EOS', 'XMR', 'SHIB', 'FTT', 'XTZ', 'CRO', 'BSV',
    'LUNA', 'BTT', 'COMP', 'HBAR', 'BTCB', 'DASH',
];

const {
    coinMarketCap_APIKEY
} = require('../config.json');

const findDips = async() => {
    const dipArray = [];

    await axios.get(`https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=${cryptoCoins}`, {
        headers: {
            "X-CMC_PRO_API_KEY": coinMarketCap_APIKEY
        }
    })
        .then((response) => {
            for(let i = 0; i < cryptoCoins.length; i++) {
                if(response.data.data[cryptoCoins[i]].quote.USD.percent_change_1h < -5.0) {
                    dipArray.push(response.data.data[cryptoCoins[i]]);
                }
            }
        })
        .catch(err => console.log(err));
    return dipArray;
}

const printDips = async(client) => {
    const dipArray = await findDips();
    const channel = client.channels.cache.find(channel => channel.name === "cryptoalert");
    const role = channel.guild.roles.cache.find(role => role.name === "crypto");

    let message = `${role} NEW DIPS!\n`;
    await dipArray.forEach(coin => {
        message += `:coin: ${coin.name}  |  **${coin.quote.USD.percent_change_24h.toFixed(2)}%**  |  **${coin.quote.USD.price.toFixed(5)}$**\n\n`
    })
    message += '====================================';

    if(dipArray.length) await channel.send(message);
}

module.exports = {
    printDips
}