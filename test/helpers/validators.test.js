// if opting for in-memory data storage

const expect = require("chai").expect;
const UserDetailsValidator = require("../../src/helpers/news.aggregator.helpers");

const usersDetails = require("../../src/db/db.news.aggregator.json");

let userDetail = {
  userId: 101,
  fullName: "John Doe",
  email: "john.doe@example.com",
  role: "user",
  password: "password123",
};

describe("Testing the validate user info functionality", function () {
  it("1. Validating user info - Validates user details successfully", async () => {
    let response = await UserDetailsValidator.validateUserInfo(
      userDetail,
      usersDetails
    );
    expect(response.status).equal(true);
    expect(response.statusCode).equal(200);
    expect(response.message).equal("User details Validated successfully!");
  });

  it("2. Validating user info - Fails if username is not unique", function (done) {
    userDetail.fullName = "ExistingUser"; // Assuming this username already exists in the usersDetails
    let response = UserDetailsValidator.validateUserInfo(
      userDetail,
      usersDetails
    );
    expect(response.status).equal(false);
    expect(response.statusCode).equal(403);
    expect(response.message).equal(
      "Username already in use. Please provide unique username!"
    );
    done();
  });

  it("3. Validating user info - Fails if email is not valid", function (done) {
    userDetail.fullName = "NewUser"; // Resetting to a new username
    userDetail.email = "invalid-email"; // Providing an invalid email
    let response = UserDetailsValidator.validateUserInfo(
      userDetail,
      usersDetails
    );
    expect(response.status).equal(false);
    expect(response.statusCode).equal(400);
    expect(response.message).equal(
      "Invalid email address! Please provide a valid email address"
    );
    done();
  });

  it("4. Validating user info - Fails if email already exists", function (done) {
    userDetail.email = "existing.email@example.com"; // Assuming this email already exists in usersDetails
    let response = UserDetailsValidator.validateUserInfo(
      userDetail,
      usersDetails
    );
    expect(response.status).equal(false);
    expect(response.statusCode).equal(403);
    expect(response.message).equal(
      "Email already exists! Please use different email id!"
    );
    done();
  });

  it("5. Validating user info - Fails if role is invalid", function (done) {
    userDetail.email = "new.email@example.com"; // Resetting email
    userDetail.role = "invalid-role"; // Providing an invalid role
    let response = UserDetailsValidator.validateUserInfo(
      userDetail,
      usersDetails
    );
    expect(response.status).equal(false);
    expect(response.statusCode).equal(400);
    expect(response.message).equal(
      "Invalid user role. Please provide a valid role!"
    );
    done();
  });

  it("6. Validating user info - Fails if user details are incomplete", function (done) {
    delete userDetail["password"]; // Removing password property
    let response = UserDetailsValidator.validateUserInfo(
      userDetail,
      usersDetails
    );
    expect(response.status).equal(false);
    expect(response.statusCode).equal(400);
    expect(response.message).equal(
      "Invalid used details! Something is missing!"
    );
    done();
  });
});

describe("Validate the login request info", function () {
  it("1. Validates login request - Successful login", function (done) {
    userDetail.email = "existing.email@example.com"; // Assuming this email exists in usersDetails
    userDetail.password = "password123"; // Assuming this is the correct password
    let response = UserDetailsValidator.validateLoginRequestInfo(userDetail);
    expect(response.status).equal(true);
    expect(response.statusCode).equal(200);
    expect(response.message).equal(
      "User email and password validated successfully!"
    );
    done();
  });

  it("2. Validates login request - Fails if user not found", function (done) {
    userDetail.email = "nonexistent.email@example.com"; // Assuming this email does not exist in usersDetails
    let response = UserDetailsValidator.validateLoginRequestInfo(userDetail);
    expect(response.status).equal(false);
    expect(response.statusCode).equal(404);
    expect(response.message).equal(
      "User not found with email nonexistent.email@example.com"
    );
    done();
  });

  it("3. Validates login request - Fails if incorrect password", function (done) {
    userDetail.email = "existing.email@example.com"; // Assuming this email exists in usersDetails
    userDetail.password = "incorrect-password"; // Assuming this is an incorrect password
    let response = UserDetailsValidator.validateLoginRequestInfo(userDetail);
    expect(response.status).equal(false);
    expect(response.statusCode).equal(401);
    expect(response.message).equal(
      "Invalid user password! Please provide correct password!"
    );
    done();
  });

  it("4. Validates login request - Fails if login information is incomplete", function (done) {
    delete userDetail["password"]; // Removing password property
    let response = UserDetailsValidator.validateLoginRequestInfo(userDetail);
    expect(response.status).equal(false);
    expect(response.statusCode).equal(400);
    expect(response.message).equal(
      "Invalid user login information! Something is missing"
    );
    done();
  });
});
