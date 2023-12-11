const newsAggregatorController = require("express").Router();
const { ErrorResponse, SuccessResponse } = require("../utils/common");
const { StatusCodes } = require("http-status-codes");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const { ENVConfig } = require("../config");

var bcrypt = require("bcrypt");
const { User } = require("../models/news.aggregator.db");

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
    return res.status(201).json({ message: "User saved successfully" });
  } catch (err) {
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

    return res.status(200).json({
      user: { id: user.id },
      message: "Login successful",
      accessToken: token,
    });
  } catch (error) {
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

    // Adjust this URL based on your requirements
    const newsApiUrl = `https://newsapi.org/v2/everything?q=${randomPreference}&apiKey=${ENVConfig.News_Aggregator_API_Key}`;

    // Fetch news articles from an external API with an authorization header
    const response = await axios.get(newsApiUrl, {
      headers: { "x-access-token": req.headers.authorization.split(" ")[1] },
    });

    // Process and filter news articles based on user preferences if needed

    SuccessResponse.data = response.data.articles; // Assuming the response structure has an 'articles' property
    SuccessResponse.message = "News Fetched Successfully";
    return res.status(Number(200)).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    ErrorResponse.message = error.message;
    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(ErrorResponse);
  }
};

module.exports = {
  signup,
  signin,
  getUserPreferences,
  updatePreferences,
  fetchNews,
};
