const newsAggregatorController = require("express").Router();
const { ErrorResponse, SuccessResponse } = require("../utils/common");
const { StatusCodes } = require("http-status-codes");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const { ENVConfig } = require("../config");

var bcrypt = require("bcrypt");
const { User } = require("../models/news.aggregator.db");

// for caching
const NodeCache = require("node-cache");
const cache = new NodeCache({ stdTTL: 600, checkperiod: 120 });

// for Logging
const winston = require("winston");

// Configure the Winston logger
const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "api.log" }),
  ],
});

// Signup endpoint
const signup = async (req, res) => {
  const user = new User({
    fullName: req.body.fullName,
    email: req.body.email,
    role: req.body.role,
    password: bcrypt.hashSync(req.body.password, 8),
    preferences: req.body.preferences,
  });

  try {
    // Save the user to the database
    await user.save();
    // Logging the successful signup
    logger.info("User signed up successfully");
    return res.status(201).json({ message: "User saved successfully" });
  } catch (err) {
    // Logging the error during signup
    logger.error(`User saving failed: ${err.message}`);
    return res.status(500).json({ message: `User saving failed ${err}` });
  }
};

// Signin endpoint
const signin = async (req, res) => {
  try {
    const emailPassed = req.body.email;
    const passwordPassed = req.body.password;

    // Find the user with the provided email
    const user = await User.findOne({ email: emailPassed });

    // Validate the user's password
    const passwordIsValid = bcrypt.compareSync(passwordPassed, user.password);

    if (!passwordIsValid) {
      return res.status(401).json({ message: "Invalid Password!" });
    }

    // Generate a token for the user
    const token = jwt.sign({ id: user.id }, ENVConfig.JWT_Secret_Key, {
      expiresIn: ENVConfig.JWT_Access_Token_Expires_In,
    });

    // Logging the successful sign-in
    logger.info("User signed in successfully");
    return res.status(200).json({
      user: { id: user.id },
      message: "Login successful",
      accessToken: token,
    });
  } catch (error) {
    // Logging the error during sign-in
    logger.error(`Error during sign-in: ${error.message}`);
    console.error("Error during sign-in:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Retrieve and return user preferences
const getUserPreferences = async (req) => {
  const preferencesEndpoint = "http://localhost:3000/preferences";
  try {
    if (!req.headers.authorization) {
      return {
        success: false,
        message: "Authorization header not found",
        data: {},
        error: "Authorization header not found",
      };
    }

    // Fetch user preferences from an external endpoint
    const userPreferencesResponse = await axios.get(preferencesEndpoint, {
      headers: { "x-access-token": req.headers.authorization.split(" ")[1] },
    });

    if (!userPreferencesResponse.data || !userPreferencesResponse.data.data) {
      return {
        success: false,
        message: "Error fetching user preferences or news",
        data: {},
        error: "Invalid response structure",
      };
    }

    const userPreferences = userPreferencesResponse.data.data.preferences;

    if (userPreferences && userPreferences.length > 0) {
      const userPreference = userPreferences[0];

      // Fetch news based on the user's preferences
      const newsApiParams = {
        q: userPreference,
        apiKey: ENVConfig.News_Aggregator_API_Key,
      };
      const newsApiResponse = await axios.get(ENVConfig.NEWS_API_URL, {
        params: newsApiParams,
      });

      return newsApiResponse.data;
    } else {
      return {
        success: false,
        message: "User has no preferences",
        data: {},
        error: {},
      };
    }
  } catch (error) {
    console.error("Error fetching user preferences or news:", error);
    return {
      success: false,
      message: "Error fetching user preferences or news",
      data: {},
      error: error.message,
    };
  }
};

// Update user preferences endpoint
const updatePreferences = async (req, res) => {
  try {
    const loggedInUser = req.user;

    if (!loggedInUser) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // Find the user by ID
    const user = await User.findById(loggedInUser);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update user preferences based on the request body
    user.preferences = req.body.preferences;

    // Save the updated user object
    const updatedUser = await user.save();

    SuccessResponse.data = updatedUser.preferences;
    SuccessResponse.message = "User News Preferences Updated Successfully";
    // Logging the successful sign-in
    logger.info("User Preferences has been updated successfully");
    return res.status(200).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    ErrorResponse.message = error.message;
    return res.status(500).json(ErrorResponse);
  }
};

// Fetch news based on user preferences
const fetchNews = async (req, res) => {
  try {
    const loggedInUser = req.user;

    if (!loggedInUser) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // Fetch user preferences from the database
    const user = await User.findById(loggedInUser);
    const preferences = user.preferences;

    // Choose a random preference for simplicity
    const randomPreference =
      preferences[Math.floor(Math.random() * preferences.length)];

    // Check if news articles are already in the cache
    const cacheKey = `news_${randomPreference}`;
    const cachedNews = cache.get(cacheKey);

    if (cachedNews) {
      logger.info("User News preferences have been Fetched from Cache");
      // If cached, return the news articles from the cache
      return res
        .status(200)
        .json({ articles: cachedNews, message: "News Fetched from Cache" });
    }

    // Fetch news articles from an external API with an authorization header
    const newsApiUrl = `https://newsapi.org/v2/everything?q=${randomPreference}&apiKey=${ENVConfig.News_Aggregator_API_Key}`;
    const response = await axios.get(newsApiUrl, {
      headers: { "x-access-token": req.headers.authorization.split(" ")[1] },
    });

    // Process and filter news articles based on user preferences if needed
    const newsArticles = response.data.articles;

    // Cache the news articles
    cache.set(cacheKey, newsArticles);
    // Logging the successful fetching
    logger.info("User News preferences have been Cached successfully");
    return res
      .status(200)
      .json({ articles: newsArticles, message: "News Fetched Successfully" });
  } catch (error) {
    // Logging the error during fetching news
    logger.error(`Error fetching news: ${error.message}`);

    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json({
        message: "Error fetching news articles",
        error: error.message,
      });
  }
};

module.exports = {
  signup,
  signin,
  getUserPreferences,
  updatePreferences,
  fetchNews,
};
