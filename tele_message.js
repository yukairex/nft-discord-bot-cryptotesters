let axios = require('axios');
let url = 'http://127.0.0.1:3000';
const postMessage = async (message) => {
  try {
    await axios.post(url + '/message', {
      message: message,
    });
  } catch (err) {
    console.log(err);
  }
};



};
module.exports.postMessage = postMessage;
