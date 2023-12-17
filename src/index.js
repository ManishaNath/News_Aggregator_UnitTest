const express = require("express");
const app = express();

const bodyParser = require("body-parser");
const newsRoutes = require("./routes/news.aggregator.routes");
const { ENVConfig, DBConfig } = require("./config");

/** Middleware */
app.use(bodyParser.json());

/** Routes */
app.use(newsRoutes);

/** Sample Endpoint */
app.get("/", (req, res) => {
  res.send("Welcome to News Aggregator Application");
});

/** Start the Server */
app.listen(ENVConfig.Port_Number, (err) => {
  if (!err) {
    console.log(
      `Server is running on port http://localhost:${ENVConfig.Port_Number}.`
    );
    console.log(`TIMESTAMP :: ${new Date().toISOString()}`);

    // Connect to the database
    DBConfig.connect();
  } else {
    console.log("Some error occurred while running the server.");
  }
});

// dependencies
// npm install --save express
// npm install --save axios  - 3p api
// npm install --save url-search-params  - to give query param
// npm install --save-dev nodemon  - automate
// npm install --save body-parser - MW
//npm install --save dotenv -> .env
//npm install --save bcrypt -> passwd
//npm install --save mongoose -> mongoDB
//npm install --save-dev jsonwebtoken  (JWT token - Registration)
//npm install newsapi --save
//npm install --save http-status-codes
//npm install node-cache
// npm install --save-dev supertest mocha
