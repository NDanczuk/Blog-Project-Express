const mongoose = require("mongoose");
const connectDB = async () => {
  try {
    mongoose.set("strictQuery", false);
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log('\x1b[36m%s\x1b[0m', `Database Connected: ${conn.connection.host}`);
  } catch (e) {
    console.error(e);
  }
};

module.exports = connectDB
