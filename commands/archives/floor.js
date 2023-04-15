const fetch = require('node-fetch');
const { quixoticAPI, network } = require('../config.json');
const { getFloors } = require("../lib/reservoir")

const CacheService = require('../cache')

const ttl = 60; //cache for 60 seconds;
const cache = new CacheService(ttl);

const fetchFloor = async () => {
  let url = `${quixoticAPI}collection/${process.env.CONTRACT_ADDRESS}/stats/`

  let settings = { 
    method: "GET",
    headers: process.env.QUIXOTIC_API_KEY == null ? {} : {
      "X-API-KEY": process.env.QUIXOTIC_API_KEY
    }
  };

  let res = await fetch(url, settings);
  if (res.status == 404 || res.status == 400)
  {
    throw new Error("Error retrieving collection stats.");
  }
  if (res.status != 200)
  {
    throw new Error(`Couldn't retrieve metadata: ${res.statusText}`);
  }

  let data = await res.json();

  return Number(data.stats.floor_price);
}

module.exports = {
	name: "floor",
	execute(message) {
    cache.get("FloorPrice", fetchFloor)
      .then((floorPrice) => {
        message.channel.send(`The current floor price is ${floorPrice.toFixed(3)}Ξ`);
      })
      .catch(error => message.channel.send(error.message));
	},
};