const fetch = require('node-fetch');
const { quixoticAPI, network } = require('../config.json');
const { checkPrice } = require("../price");
const { postTweet, sleep } = require('../tweet');

var salesCache = [];
var lastTimestamp = null;

const eventQueue = [];


const main = async () => {

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
      console.log(`querying twitter event....`)

      // URL https://api.quixotic.io/api/v1/opt/collection/
      let url = `${quixoticAPI}${network}/collection/${process.env.CONTRACT_ADDRESS}/activity/?event=SA&event=MI&limit=10`
  
      try {
        var res = await fetch(url, settings);
        if (res.status != 200) {
          throw new Error(`Couldn't retrieve events: ${res.statusText}`);
        }

        let data = await res.json();
   

        next = null; // a temproray fix

        data.results.forEach(async function (event) {
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
              let url = event.token.image_url;
              let id = event.token.token_id;
              let end_price = event.end_price / (1e9);
              let end_price_usd = (end_price*price.ethereum.usd).toFixed(2);
              let from = event.from_profile.address.slice(0, 8)
              let to = event.to_profile.address.slice(0, 8)
              let tx = `https://optimistic.etherscan.io/tx/${event.txn_id}`
              let note = `Powered by Quixotic API`
              let quixoticURL = `https://quixotic.io/asset/${process.env.CONTRACT_ADDRESS}/${event.token.token_id}`

              let message = `Tester ${id} bought for ${end_price}\u039E ($${end_price_usd}) by ${to} from ${from}. ${quixoticURL} #cryptotesters #optimism`

              eventQueue.push({
                url,
                message,
                id
              })
            }

            if (event.event_type == 'Mint') {


              let url = event.token.image_url;
              let id = event.token.token_id;
              let end_price = 0.3
              let end_price_usd = (0.3 *price.ethereum.usd).toFixed(2);
              let to = event.to_profile.address.slice(0, 8)
              let tx = `https://optimistic.etherscan.io/tx/${event.txn_id}`
              let note = `Powered by Quixotic API`
              let quixoticURL = `https://quixotic.io/asset/${process.env.CONTRACT_ADDRESS}/${event.token.token_id}`
              let message = `Tester ${id} minted for ${end_price}\u039E ($${end_price_usd}) by ${to}. ${quixoticURL} #cryptotesters #optimism`

              eventQueue.push({
                url,
                message,
                id
              })

            }
            

            // new mint



        });
      }
      catch (error) {
        console.error(error);
        return;
      }
    } while (next != null && newEvents)

    lastTimestamp = newTimestamp;
}





async function processQueue() {


  if (!eventQueue.length) return;
  
  let event = eventQueue.shift();

  console.log(`processing queue, length: ${eventQueue.length}`)

  try {
    await postTweet(event.message, event.url, event.id);
  }catch (err) {
    console.log(err);
  }

  await sleep(10000)
  return;
}



main()
//setInterval(main, 60000);
setInterval(processQueue, 60000);

