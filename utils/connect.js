const mongoose = require("mongoose");

const connectDB = async (url) => {
  mongoose.set("strictQuery", true);
  try {
    const connection = await mongoose.connect(url, {
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
      keepAlive: true,
    });
    if (connection) {
      console.log("MongoDB Connected");
    }
  } catch (error) {
    console.log(error);
  }
};

module.exports = connectDB;
