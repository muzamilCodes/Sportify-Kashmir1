const mongoose = require("mongoose");
require('dotenv').config()

const connectDb = async () => {
  try {
    // so something here
    const uri =   process.env.MONGO_URI
      
    // const localUri  ="mongodb://localhost:27017/InterServer"

    await mongoose.connect(uri);

    console.log(`Db Connected!`);

  } catch (error) {
    console.log(error);
  }
};


module.exports = connectDb

