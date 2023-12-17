const supertest = require("supertest");
const app = require("../../src/index");
const assert = require("assert");

describe("API End-to-End Tests", () => {
  let authToken; // To store the authentication token for subsequent requests

  ////////// SIGNUP ///////////////////
  // Test case for the signup endpoint
  it("should sign up a new user", async () => {
    const response = await request(app)
      .post("/register")
      .send({
        fullName: "John Doe",
        email: "john.doe@example.com",
        role: "normal",
        password: "password123",
        preferences: ["sports", "technology"],
      });

    assert.strictEqual(response.status, 201);
    assert.strictEqual(response.body.message, "User saved successfully");

    // Unhappy Case: Trying to sign up with an existing email
    const duplicateResponse = await request(app)
      .post("/register")
      .send({
        fullName: "Duplicate User",
        email: "john.doe@example.com", // Use an email that already exists
        role: "normal",
        password: "password123",
        preferences: ["sports", "technology"],
      });

    assert.strictEqual(duplicateResponse.status, 500); // or 409 Conflict
    assert.strictEqual(
      duplicateResponse.body.message,
      'User saving failed: E11000 duplicate key error dup key: { email: "john.doe@example.com" }'
    );
  });

  /////////// LOGIN API//////////////

  // Test case for the login endpoint
  it("should log in a user", async () => {
    const response = await request(app).post("/login").send({
      email: "john.doe@example.com",
      password: "password123",
    });

    assert.strictEqual(response.status, 200);
    assert.strictEqual(response.body.message, "Login successful");
    assert.ok(response.body.accessToken);

    // Save the authentication token for subsequent requests
    authToken = response.body.accessToken;

    // Unhappy Case: Trying to log in with incorrect credentials
    const incorrectCredentialsResponse = await request(app)
      .post("/login")
      .send({
        email: "john.doe@example.com",
        password: "incorrectPassword",
      });

    assert.strictEqual(incorrectCredentialsResponse.status, 401);
    assert.strictEqual(
      incorrectCredentialsResponse.body.message,
      "Invalid Password!"
    );
  });

  /////////// GET Preference /////////

  // Test case for the preferences endpoint
  it("should retrieve user preferences", async () => {
    const response = await request(app)
      .get("/preferences")
      .set("Authorization", `Bearer ${authToken}`);

    assert.strictEqual(response.status, 200);
    assert.ok(response.body.success);
    assert.strictEqual(
      response.body.message,
      "User preferences retrieved successfully"
    );

    // Unhappy Case: Trying to retrieve preferences without authentication
    const unauthenticatedResponse = await request(app).get("/preferences");

    assert.strictEqual(unauthenticatedResponse.status, 401);
    assert.strictEqual(
      unauthenticatedResponse.body.message,
      "Authorization header not found"
    );
  });

  ///////////UPDATE PREFERENCE //////////
  // Test case for updating preferences endpoint
  it("should update user preferences", async () => {
    const response = await request(app)
      .put("/preferences")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        preferences: ["entertainment", "health"],
      });

    assert.strictEqual(response.status, 200);
    assert.ok(response.body.success);
    assert.strictEqual(
      response.body.message,
      "User preferences updated successfully"
    );

    // Unhappy Case: Trying to update preferences without authentication
    const unauthenticatedResponse = await request(app)
      .put("/preferences")
      .send({
        preferences: ["entertainment", "health"],
      });

    assert.strictEqual(unauthenticatedResponse.status, 401);
    assert.strictEqual(
      unauthenticatedResponse.body.message,
      "Authorization header not found"
    );
  });

  //////////////fetch news //////////////
  // Test case for fetching news endpoint
  it("should fetch news based on user preferences", async () => {
    const response = await request(app)
      .get("/news")
      .set("Authorization", `Bearer ${authToken}`);

    assert.strictEqual(response.status, 200);
    assert.ok(response.body.success);
    assert.strictEqual(response.body.message, "News fetched successfully");
    assert.ok(response.body.articles);

    // Unhappy Case: Trying to fetch news without authentication
    const unauthenticatedResponse = await request(app).get("/news");

    assert.strictEqual(unauthenticatedResponse.status, 401);
    assert.strictEqual(
      unauthenticatedResponse.body.message,
      "Authorization header not found"
    );
  });
});

