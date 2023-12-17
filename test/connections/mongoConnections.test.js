const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

before(async function () {
  try {
    await mongoose.connect("mongodb://localhost:27017/newsAggregatorTestDB", {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    });
    console.log("Connected to the database");
  } catch (err) {
    console.error("Error connecting to the database:", err);
    throw err; // Fail the test if connection fails
  }
});

beforeEach((done) => {
  console.log("Running before each test");
  mongoose.connection.collections.users.drop(() => {
    done();
  });
});

afterEach((done) => {
  console.log("Running after each test");
  mongoose.connection.collections.users.drop(() => {
    done();
  });
});

after(async function () {
  console.log("Disconnecting the database");
  try {
    await mongoose.disconnect();
    console.log("Disconnected from the database");
  } catch (err) {
    console.error("Error disconnecting from the database:", err);
    throw err; // Fail the test if disconnection fails
  }
});
