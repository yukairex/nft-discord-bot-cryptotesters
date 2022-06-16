const fetch = require('node-fetch');
const Discord = require('discord.js');
const { quixoticAPI, network } = require('../config.json');
const { checkPrice } = require("../price");

var salesCache = [];
var lastTimestamp = null;

module.exports = {
  name: 'sales',
  description: 'sales bot',
  interval: 60000,
  enabled: process.env.DISCORD_SALES_CHANNEL_ID != null,
  async execute(client) {
    if (lastTimestamp == null) {
      //lastTimestamp = Math.floor(Date.now() / 1000) - 120;
      lastTimestamp = 1653746603; // initial deployment
    } else {
      lastTimestamp -= 30;
    }
    let newTimestamp = Math.floor(Date.now() / 1000) - 30;

    let next = null;
    let newEvents = true;
    let settings = {
      method: "GET",
      headers: process.env.QUIXOTIC_API_KEY == null ? {} : {
        "X-API-KEY": process.env.QUIXOTIC_API_KEY
      }
    };

    // query price from coingecko
    let price =  await checkPrice(['ethereum']);


    do {
      //console.log(`querying sales event....`)

      // URL https://api.quixotic.io/api/v1/opt/collection/
      let url = `${quixoticAPI}${network}/collection/${process.env.CONTRACT_ADDRESS}/activity/?event=SA&limit=10`
  
      try {
        var res = await fetch(url, settings);
        if (res.status != 200) {
          throw new Error(`Couldn't retrieve events: ${res.statusText}`);
        }

        let data = await res.json();
   

        next = null; // a temproray fix

        data.results.forEach(function (event) {
            if (salesCache.includes(event.txn_id)) {
              newEvents = false;
              return;
            } else {
              salesCache.push(event.txn_id);
              if (salesCache.length > 200) salesCache.shift();
            }

            // list to new events only
            if ((Date.parse(event.timestamp) / 1000) < lastTimestamp) {
              newEvents = false;
              return;
            }

            // new sale
            console.log(event)


          

            if (event.event_type == 'Sale' && event.order_status == 'fulfilled') {

              // temp solution for op
              if (event.end_price/1e9 > 10) return;

              const embedMsg = new Discord.MessageEmbed()
              .setColor('#0099ff')
              .setTitle(event.token.name)
              .setURL(`https://quixotic.io/asset/${process.env.CONTRACT_ADDRESS}/${event.token.token_id}`)
              .setDescription(`has just been sold for ${event.end_price / (1e9)}\u039E`)
              .setImage(event.token.image_url)
              .addField("Ethereum",`${event.end_price / (1e9)}\u039E`, true)
              .addField("USD",`$${(event.end_price/1e9*price.ethereum.usd).toFixed(0)}`, true)
              .addField("Link",`[Link](https://quixotic.io/asset/${process.env.CONTRACT_ADDRESS}/${event.token.token_id})`, true)
              .addField("From", `[${event.from_profile.user?.username || event.from_profile.address.slice(0, 8)}](https://optimistic.etherscan.io/address/${event.from_profile.address})`, true)
              .addField("To", `[${event.to_profile.user?.username || event.to_profile.address.slice(0, 8)}](https://optimistic.etherscan.io/address/${event.to_profile.address})`, true)
              .addField("Transaction",`[Tx](https://optimistic.etherscan.io/tx/${event.txn_id})`, true)
              .setFooter(`Powered by Quixotic API`)
              client.channels.fetch(process.env.DISCORD_SALES_CHANNEL_ID)
                .then(channel => {
                  channel.send(embedMsg);
                })
                .catch(console.error);
            }
        });
      }
      catch (error) {
        console.error(error);
        return;
      }
    } while (next != null && newEvents)

    lastTimestamp = newTimestamp;
  }
};

