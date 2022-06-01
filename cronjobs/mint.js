const fetch = require('node-fetch');
const Discord = require('discord.js');
const { quixoticAPI, network } = require('../config.json');

var salesCache = [];
var lastTimestamp = null;

module.exports = {
  name: 'mint',
  description: 'mint bot',
  interval: 30000,
  enabled: process.env.DISCORD_SALES_CHANNEL_ID != null,
  async execute(client) {
    if (lastTimestamp == null) {
      lastTimestamp = Math.floor(Date.now() / 1000) - 120;
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
    do {
      // URL https://api.quixotic.io/api/v1/opt/collection/
      let url = `${quixoticAPI}${network}/collection/${process.env.CONTRACT_ADDRESS}/activity/?event=MI&limit=10&offset=10`
  
      try {
        var res = await fetch(url, settings);
        if (res.status != 200) {
          throw new Error(`Couldn't retrieve events: ${res.statusText}`);
        }

        let data = await res.json();
   

        next = data.next;

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

            if (event.event_type == 'Mint') {
              const embedMsg = new Discord.MessageEmbed()
              .setColor('#0099ff')
              .setTitle(event.token.name)
              .setURL(`https://quixotic.io/asset/${process.env.CONTRACT_ADDRESS}/${event.token.token_id}`)
              .setDescription(`has just been minted`)
              .setImage(event.token.image_url)
              .addField("Owner", `[${event.to_profile.user?.username || event.to_profile.address}](https://etherscan.io/address/${event.to_profile.address})`, true);

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

