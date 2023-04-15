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


const getSales = async (address, startTimestamp=0,endTimestamp=1681563474, apiKey=process.env.RESERVIOR_APIKEY) => {


    const url = `https://api-optimism.reservoir.tools/sales/v4?includeDeleted=false&collection=${address}&orderBy=time&sortDirection=asc&startTimestamp=${startTimestamp}&${endTimestamp}=1681563474&limit=10`
    console,log(url);
    try { 
        // const url = `${endpoint}sales/v4?includeDeleted=false&collection=${temp}endTimestamp=${endTimestamp}&limit=10`
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

