const fetch = require('node-fetch');
const { quixoticAPI, network } = require('../config.json');
const { getFloors } = require("../lib/reservoir")

const CacheService = require('../cache')

const ttl = 60; //cache for 60 seconds;
const cache = new CacheService(ttl);

// const fetchFloor = async () => {


//   let result = getFloors(process.env.CONTRACT_ADDRESS)

//   return Number(data.stats.floor_price);
// }

module.exports = {
	name: "floor",
	execute(message) {
    cache.get("FloorPrice", getFloors)
      .then((floorPrice) => {
        if (floorPrice != undefined)
           message.channel.send(`The current floor price is ${floorPrice.price.amount.decimal} ${floorPrice.price.currency.symbol}`);
        else 
           message.channel.send("Floor fetching error")
      })
      .catch(error => message.channel.send(error.message));
	},
};