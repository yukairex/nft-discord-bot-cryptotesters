# NFT Discord Bot
This is a discord bot for CryptoTesters Community, forked from https://github.com/lucid-eleven/nft-discord-bot. 
All the token metadata is being retrieved from Quixotic Market API instead of directly from the tokenURI in the smart contract.

# Supported functions
The following functions are currently supported:

## Automatic Posts
### **Sales**
The bot will look up sales events on Quixotic every 30 seconds, and all newly closed sales will be posted to the configured Discord channel.

![Sales bot example](https://i.imgur.com/RkTzrAW.png)

### **Minting**
The bot will look up mint events on Quixotic every 30 seconds, and all newly created mints will be posted to the configured Discord channel.

# Configuration

## Bot Configuration

All configuration is done via environment variables, which are as follows:
| Env Var      | Description |
| ----------- | ----------- |
| CONTRACT_ADDRESS      | Contract address for the Crypto Tester       |
| DISCORD_BOT_TOKEN   | Pretty self explanatory        |
| DISCORD_SALES_CHANNEL_ID   | The discord channel id where events should be posted to, should look like a long number. |
| QUIXOTIC_API_KEY | Contact Quixotic to request an API key |

# Deployment
If running locally, just checkout the repository and run
  
`npm install`

followed by

`npm start`