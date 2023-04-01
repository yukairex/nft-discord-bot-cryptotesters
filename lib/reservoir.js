const endpoint = 'https://api-optimism.reservoir.tools/'
const axios = require("axios")
require('dotenv').config();


const querySingleCollection = async (address, apiKey=process.env.RESERVIOR_APIKEY) => {

    try { 
        const url = `${endpoint}collections/v5?id=${address}`
        const data = await axios.get(url, {
            headers: {
                'x-api-key': apiKey
              }
        });
        console.log(data.data.collections[0]);
        
        let result =  
        {
            name: data.data.collections[0].name,
            floor: data.data.collections[0].floorAsk.price,
        }
       console.log(result)
        return result

    }
    catch (err) {
        console.log(err);
    }
}


const getSales = async (addresses, endTimestamp=0, apiKey=process.env.RESERVIOR_APIKEY) => {
    let temp = ''
    for (let k in addresses) {
        temp = temp+'contract='+addresses[k]+'&'
    };


    try { 
        const url = `${endpoint}sales/v4?${temp}endTimestamp=${endTimestamp}&limit=10`
       // console.log(url)
        const data = await axios.get(url, {
            headers: {
                'x-api-key': apiKey
              }
        });
       // console.log(data.data.sales);
    
        return data.data.sales

    }
    catch (err) {
        console.log(err);
    }
}


// getSales(["0x18a1bC18cEfdc952121F319039502FDD5f48B6fF"])

module.exports.getSales = getSales
module.exports.querySingleCollection = querySingleCollection

