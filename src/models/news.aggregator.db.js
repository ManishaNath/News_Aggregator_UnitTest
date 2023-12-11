var mongoose = require("mongoose");
const Schema = mongoose.Schema;

// User validations are defined in this schema
var userSchema = new Schema({
  fullName: {
    type: String,
    required: [true, "fullname not provided"], // Full name is a required field
  },

  email: {
    type: String,
    required: [true, "email not provided"],
    lowercase: true, // Convert uppercase characters to lowercase
    trim: true, // Trim whitespaces
    unique: [true, "email already exists in DB"], // Ensure the email is unique in the database
    validate: {
      validator: function (v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); // Validate the email using regex
      },
      message: "Email is not valid!",
    },
  },
  role: {
    type: String,
    required: [true, "role not provided"],
    enum: ["admin", "normal"], // User role should be either "admin" or "normal"
  },
  password: {
    type: String,
    required: [true, "password not provided"],
  },
  preferences: {
    type: [String], // User preferences for news
    default: [], // Default to an empty array if not provided
  },
  created: {
    type: Date,
    default: Date.now, // Default timestamp for when the user is created
  },
});

// Create the User model
const User = mongoose.model("User", userSchema);

module.exports = {
  User, // Export the User model
};
