const Discord = require('discord.js');
const { getSales } = require("../lib/reservoir");
require('dotenv').config();
const addresses = [process.env.CONTRACT_ADDRESS]
const { checkPrice } = require("../price");
const {sleep} = require("../tweet");

var lastTimestamp = null;
var salesCache = [];

module.exports = {
    name: 'sales',
    description: 'sales bot',
    interval: 30000,
    enabled: process.env.DISCORD_SALES_CHANNEL_ID != null,
    async execute(client) {

        if (lastTimestamp == null) {
            lastTimestamp = Math.floor(Date.now() / 1000) - 120;
           // lastTimestamp = 1681393909 - 100; // initial deployment
          } 
          let newTimestamp = Math.floor(Date.now() / 1000) - 60 * 3;
      
          let next = null;
          let newEvents = true;


        let price =  await checkPrice(['ethereum']);
        
        console.log(`checking new sales end from ${lastTimestamp} to ${newTimestamp}`)
        let sales = await getSales(addresses, lastTimestamp, newTimestamp);
        console.log(`found ${sales.length} sales`);
        for (let sale of sales){
            let parsedData = parseSale(sale);
          
            let { saleId, tokenId,filledPrice, currency, from, to, txHash } = parsedData

            if (salesCache.includes(saleId)) {
                newEvents = false;
                break;
            } else {
                salesCache.push(saleId);
                if (salesCache.length > 200) salesCache.shift();
            }

            console.log(parsedData)

            const embedMsg = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setTitle(`Tester${tokenId}`)
            .setURL(`${generateOpenseaURL(tokenId)}`)
            .setDescription(`has just been sold for ${filledPrice} ${currency}`)
            .setImage(generateURL(tokenId))
            .addField(`${currency}`,`${filledPrice}`, true)
            .addField("USD",`$${(filledPrice*price.ethereum.usd).toFixed(0)}`, true)
            .addField("Link",`[Link](${generateOpenseaURL(tokenId)})`, true)
            .addField("From", `[${from.slice(0, 8)}](https://optimistic.etherscan.io/address/${from})`, true)
            .addField("To", `[${to.slice(0, 8)}](https://optimistic.etherscan.io/address/${to})`, true)
           .addField("Transaction",`[Tx](https://optimistic.etherscan.io/tx/${txHash})`, true)

            client.channels.fetch(process.env.DISCORD_SALES_CHANNEL_ID)
              .then(channel => {
                channel.send(embedMsg);
              })
              .catch(console.error);
            
              await sleep(500);
          }



        lastTimestamp  = newTimestamp;

        }


}






const parseSale = (sale) => {
    //console.log(sale)
    let {orderSource, from, to, orderSide, amount, fillSource, price, txHash, token, saleId} = sale;
    let  filledPrice = price.amount.decimal;
    let currency = price.currency.symbol;
   // let collection = token.contract;
  
    return {
        tokenId:token.tokenId,
        filledPrice,
        currency,
        orderSource,
        fillSource,
        from,
        to,
        orderSide,
        amount,
        txHash,
        saleId
    }
}


const generateURL = (id) => {
  return `https://cryptotesters.mypinata.cloud/ipfs/QmdwSvMaprFBQ7EjdiJ67GYVFgr6q18W4u2pK6f65BqnCh/${id}.png`
}

const generateOpenseaURL = (id) => {
  return `https://opensea.io/assets/optimism/${process.env.CONTRACT_ADDRESS}/${id}`
}

