const mongoose = require("mongoose");
const { MongoDB_URI } = require("./env.config");

const connect = async () => {
  try {
    await mongoose.connect(MongoDB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to the database:", error.message);
    process.exit(1);
  }
};

module.exports = { connect };
