const dotenv = require("dotenv");

dotenv.config();

module.exports = {
  Port_Number: process.env.Port_Number || 4000,
  SALT_ROUNDS: process.env.SALT_ROUNDS || 9,
  JWT_Access_Token_Expires_In: process.env.JWT_Access_Token_Expires_In || "1d",
  JWT_Secret_Key: process.env.JWT_Secret_Key || "ThisisSecret9999@",
  News_Aggregator_API_Key: process.env.News_Aggregator_API_Key,
  NEWS_API_URL: process.env.NEWS_API_URL,
};
