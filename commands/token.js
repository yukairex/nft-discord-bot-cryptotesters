const fetch = require('node-fetch');
const { quixoticAPI, network } = require('../config.json');
const Discord = require('discord.js');

module.exports = {
	name: process.env.DISCORD_TOKEN_COMMAND || "token",
	execute(message, args) {
    if (!args.length) {
      return message.channel.send(`You didn't provide a token id, ${message.author}!`);
    }

    if (isNaN(parseInt(args[0]))) {
      return message.channel.send(`Token id must be a number!`);
    }

    let url = `${quixoticAPI}/asset/${process.env.CONTRACT_ADDRESS}:${args[0]}`;
    console.log(url)
    let settings = { 
      method: "GET",
      headers: process.env.QUIXOTIC_API_KEY == null ? {} : {
        "X-API-KEY": process.env.QUIXOTIC_API_KEY
      }
    };
    
    fetch(url, settings)
        .then(res => {
          if (res.status == 404 || res.status == 400)
          {
            throw new Error("Token id doesn't exist.");
          }
          if (res.status != 200)
          {
            throw new Error(`Couldn't retrieve metadata: ${res.statusText}`);
          }
          return res.json();
        })
        .then((metadata) => {
            console.log(metadata)
            const embedMsg = new Discord.MessageEmbed()
              .setColor('#0099ff')
              .setTitle(metadata.name)
              .setURL( `https://quixotic.io/asset/${process.env.CONTRACT_ADDRESS}/${metadata.token_id}`)
              .addField("Owner", `[${metadata.owner.username?.username || metadata.owner.address.slice(0, 8)}](https://quixotic.io/${metadata.owner.address})`, true)    
              // .addField("Owner", metadata.owner.user?.username || metadata.owner.address.slice(0,8), true)
              .addField("Link",`[Link](https://quixotic.io/asset/${process.env.CONTRACT_ADDRESS}/${metadata.token_id})`, true)
              .setImage(metadata.image_url);

            metadata.traits.forEach(function(trait){
              embedMsg.addField(trait.trait_type, `${trait.value} (${Number(trait.trait_count/metadata.collection.stats.count).toLocaleString(undefined,{style: 'percent', minimumFractionDigits:2})})`, true)
              //embedMsg.addField(trait.trait_type, `${trait.value}`, true)
            });

            message.channel.send(embedMsg);
        })
        .catch(error => message.channel.send(error.message));
	},
};