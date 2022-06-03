require('dotenv').config()
const {TwitterApi} = require('twitter-api-v2')
const download = require('image-downloader');
const { text } = require('express');


const client = new TwitterApi({
    appKey: process.env.TWITTER_API_KEY,
    appSecret:process.env.TWITTER_API_SECRET,
    accessToken: process.env.TWITTER_ACCESS_TOKEN,
    accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
    });


function downloadImage(url, filepath) {
    return download.image({
        url,
        dest: filepath 
    }).then(({ filename }) => {
        console.log('Saved to', filename); // saved to /path/to/dest/image.jpg
        return true
    })
    .catch((err) => {
        console.error(err)
        return false
    });
}

function sleep(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
  }


const postTweet =  async (text, imageURL, nftID) => {

    let succsess = await downloadImage(imageURL, `../../image/${nftID}.png`)
    //console.log(succsess)
    await sleep(1000);

    if (succsess) {
       const mediaIds = await Promise.all([
            client.v1.uploadMedia(`./image/${nftID}.png`),
        ]);

        await client.v1.tweet(text, { media_ids: mediaIds });
        console.log(`twitter posting complete`)
    }
}

module.exports = {
    postTweet,
    sleep
}
