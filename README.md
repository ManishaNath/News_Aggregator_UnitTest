# News_Aggregator_App

RESTful API using Node.js, Express.js, and NPM packages. The API will allow users to register, log in, and set their news preferences (e.g., categories, sources). The API will then fetch news articles from multiple sources using external news APIs. The fetched articles should be processed and filtered asynchronously on user preference.

## Additionally,

Implements input validation and sanitization for user registration, event creation, and updates.

Optimizes performance by implementing caching.

Implements unit testing and write test cases for the API endpoints, focusing on testing input validation and proper functioning of CRUD operations to achieve good test coverage and test edge cases.

Refactors the API code to improve error handling, ensuring that appropriate error messages are returned for different types of errors (e.g., validation errors, authentication errors, authorization errors, and server errors).

Logging the API requests and responses for auditing purposes. Use a logging library like Winston or Morgan to log request and response data.

## How To Run The Project

### Clone the Repository

```bash
https://github.com/ManishaNath/News_Aggregator_UnitTest/tree/dev

> Navigate to the Project Directory
--  cd News_Aggregator_UnitTest

> Install the dependencies, Node modules get generated
--  npm install

> Run the project under dev dependencies
--  npm run dev

> Run the unit test
--  npm run test
```

## Dependencies

package.json file contains all the dependencies.

# Architecture

## Backend

The backend is built using Node.js with Express.js as the web application framework. MongoDB is used as the database to store user information, preferences, and other relevant data. Mongoose is employed as an ODM (Object Data Modeling) library for MongoDB.

## Controllers

### User Authentication:

Handles user signup, login, and token generation using bcrypt for password hashing and JWT (JSON Web Token) for authentication.

### User Preferences:

Manages user preferences, allowing users to set their preferred topics for news articles.

### News Aggregation:

Fetches news articles from external APIs based on user preferences.

## Middleware

### Authentication Middleware:

Verifies user authentication using JWT before processing requests that require authentication.
Helpers

### News Aggregator Promise:

Provides helper functions for handling promises related to news aggregation.

## Database

MongoDB is chosen as the database for its flexibility and scalability. The database stores user details, including full name, email, role, hashed password, preferences, and timestamps.

## User Authentication

User authentication is implemented using JWT. Upon successful login, a token is generated and sent to the client, which is then included in subsequent requests to authenticate the user.

## User Preferences

Users can set their news preferences, specifying topics of interest. The application uses these preferences to tailor the news feed for each user.

## News Aggregation

News aggregation involves fetching news articles from external APIs. Axios is used as the HTTP client to make requests to the News API. The application dynamically selects a random preference from the user's list to diversify the news feed.

## Testing

open browser and type in http://localhost:3000/ and hit enter!

# Deployment

The application can be deployed on cloud platforms like AWS, Heroku, or similar services. Continuous Integration (CI) and Continuous Deployment (CD) pipelines can be set up for automated testing and deployment.

# Conclusion

The News Aggregator Application provides a seamless experience for users to stay updated on topics they care about. Its modular architecture allows for easy scalability and maintenance.

## Folder Structure



├───src
│   ├───config
│   ├───db
│   ├───controllers
│   ├───middlewares
│   ├───models
│   ├───routes
│   └───utils
│       ├───common
├───test
│   ├───connections
│   ├───helpers
│   ├───models
│   ├───middlewares
│   ├───routes

\_**\_index.js
\_\_**.env
\_**\_.gitignore
\_\_**package-lock.json
\_\_\_\_package.json
\_\_\_\_api.log




