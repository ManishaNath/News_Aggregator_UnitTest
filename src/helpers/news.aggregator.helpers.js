// for In-memory data storage
const usersDetails = require("../db/db.news.aggregator.json");
const bcrypt = require("bcrypt");

class UserDetailsValidator {
  static validateUserInfo(userDetail, usersDetails) {
    if (
      userDetail.hasOwnProperty("userId") &&
      userDetail.hasOwnProperty("fullName") &&
      userDetail.hasOwnProperty("email") &&
      userDetail.hasOwnProperty("role") &&
      userDetail.hasOwnProperty("password")
    ) {
      let usersData = JSON.parse(JSON.stringify(usersDetails));
      let isUserNameExists = usersData.users.findIndex(
        (user) => user.fullName === userDetail.fullName
      );
      if (isUserNameExists == -1) {
        let isValidEmail = function (email) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        };
        if (isValidEmail(userDetail.email)) {
          let isEmailAlreadyExists = usersData.users.findIndex(
            (user) => user.email === userDetail.email
          );
          if (isEmailAlreadyExists == -1) {
            let checkIsValidRole = userDetail.role;
            if (checkIsValidRole) {
              return {
                status: true,
                statusCode: 200,
                message: "User details Validated successfully!",
              };
            } else {
              return {
                status: false,
                statusCode: 400,
                message: "Invalid user role. Please provide a valid role!",
              };
            }
          } else {
            return {
              status: false,
              statusCode: 403,
              message: "Email already exists! Please use different email id!",
            };
          }
        } else {
          return {
            status: false,
            statusCode: 400,
            message: `Invalid email address! Please provide a valid email address`,
          };
        }
      } else {
        return {
          status: false,
          statusCode: 403,
          message: "Username already in use. Please provide unique username!",
        };
      }
    } else {
      return {
        status: false,
        statusCode: 400,
        message: `Invalid used details! Something is missing!`,
      };
    }
  }

  static validateLoginRequestInfo(userDetail) {
    if (
      userDetail.hasOwnProperty("email") &&
      userDetail.hasOwnProperty("password")
    ) {
      let usersData = JSON.parse(JSON.stringify(usersDetails));
      let isEmailAlreadyExists = usersData.users.findIndex(
        (user) => user.email === userDetail.email
      );
      if (isEmailAlreadyExists !== -1) {
        let userData = usersData.users.filter(
          (user) => user.email === userDetail.email
        );
        // console.log('userdata: ' + JSON.stringify(userData));
        let isUserPasswordValid = bcrypt.compareSync(
          userDetail.password,
          userData[0].password
        );
        if (isUserPasswordValid) {
          return {
            status: true,
            statusCode: 200,
            message: "User email and password validated successfully!",
            userData: userData,
          };
        } else {
          return {
            status: false,
            statusCode: 401,
            message: "Invalid user password! Please provide correct password!",
          };
        }
      } else {
        return {
          status: false,
          statusCode: 404,
          message: `User not found with email ${userDetail.email}`,
        };
      }
    } else {
      return {
        status: false,
        statusCode: 400,
        message: "Invalid user login information! Something is missing",
      };
    }
  }
}

module.exports = UserDetailsValidator;
