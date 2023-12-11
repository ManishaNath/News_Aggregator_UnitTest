const express = require("express");
const routes = express.Router();
const app = express();

const newsController = require("../controllers/news.aggregator.controller");
const authenticateUser = require("../middleware/news.aggregator.middleware");

// POST/register: Register a new user.
routes.post("/register", newsController.signup);
// POST/login: Log in a user.
routes.post("/login", newsController.signin);
// GET /preferences: Retrieve the news preferences for the logged-in user.
routes.get("/preferences", authenticateUser, (req, res) => {
  newsController.getUserPreferences(req).then((response) => {
    console.log(response);
    res.json(response);
  });
});
// PUT /preferences: Update the news preferences for the logged-in user.
routes.put("/preferences", authenticateUser, newsController.updatePreferences);
// GET /news: Fetch news articles based on the logged-in user's preferences.
routes.get("/news", authenticateUser, newsController.fetchNews);

module.exports = routes;
