const { User } = require("../../src/models/news.aggregator.db");
const expect = require("chai").expect;
const bcrypt = require("bcrypt");
const sinon = require("sinon");

// Without mocking the DB
describe("User Model Validation", function () {
  it("1. Should create a new user successfully", (done) => {
    const user = new User({
      fullName: "John Doe",
      email: "john.doe@example.com",
      role: "admin",
      password: bcrypt.hashSync("test1234", 8),
    });

    user
      .save()
      .then((savedUser) => {
        expect(savedUser.fullName).equal("John Doe");
        expect(savedUser.email).equal("john.doe@example.com");
        expect(savedUser.role).equal("admin");
        expect(savedUser.password).not.equal("test1234"); // Password should be hashed
        expect(savedUser.preferences).to.deep.equal([]); // Default preferences should be an empty array
        done();
      })
      .catch((err) => {
        done(err);
      });
  });

  it("2. Should fail to create a user with invalid email", (done) => {
    const user = new User({
      fullName: "Invalid Email",
      email: "invalid.email", // Invalid email format
      role: "normal",
      password: bcrypt.hashSync("test1234", 8),
    });

    user.save().catch((err) => {
      expect(err.errors.email.message).equal("Email is not valid!");
      done();
    });
  });

  it("3. Should fail to create a user without a required field", (done) => {
    const user = new User({
      email: "missing.fullname@example.com", // Missing fullName field
      role: "admin",
      password: bcrypt.hashSync("test1234", 8),
    });

    user.save().catch((err) => {
      expect(err.errors.fullName.message).equal("fullname not provided");
      done();
    });
  });

  it("4. Should fail to create a user with a non-unique email", (done) => {
    const existingUser = new User({
      fullName: "Existing User",
      email: "existing.email@example.com",
      role: "normal",
      password: bcrypt.hashSync("test1234", 8),
    });

    existingUser
      .save()
      .then(() => {
        const user = new User({
          fullName: "Duplicate Email",
          email: "existing.email@example.com", // Duplicate email
          role: "admin",
          password: bcrypt.hashSync("test1234", 8),
        });

        return user.save();
      })
      .catch((err) => {
        expect(err.errors.email.message).equal("email already exists in DB");
        done();
      });
  });

  it("5. Should fail to create a user with an invalid role", (done) => {
    const user = new User({
      fullName: "Invalid Role",
      email: "invalid.role@example.com",
      role: "invalid_role", // Invalid role
      password: bcrypt.hashSync("test1234", 8),
    });

    user.save().catch((err) => {
      expect(err.errors.role.message).equal(
        "`invalid_role` is not a valid enum value for path `role`."
      );
      done();
    });
  });

  it("6. Should create a user with preferences", (done) => {
    const user = new User({
      fullName: "User with Preferences",
      email: "user.with.preferences@example.com",
      role: "normal",
      password: bcrypt.hashSync("test1234", 8),
      preferences: ["sports", "technology"], // User preferences
    });

    user
      .save()
      .then((savedUser) => {
        expect(savedUser.preferences).to.deep.equal(["sports", "technology"]);
        done();
      })
      .catch((err) => {
        done(err);
      });
  });
});

// with mocking DB
describe("Creating the documents in mongodb - With mocking", () => {
  let saveStub;
  const user = new User({
    fullName: "test",
    email: "test123@gmail.com",
    role: "admin",
    password: bcrypt.hashSync("test1234", 8),
  });

  beforeEach(() => {
    saveStub = sinon.stub(User.prototype, "save");
  });

  afterEach(() => {
    saveStub.restore();
  });

  it("1. Should save the user", async function () {
    const mockUser = {
      _id: 123,
      fullName: "test user",
      email: "test1234@gmail.com",
    };
    saveStub.resolves(mockUser);

    const result = await user.save();
    expect(result).to.deep.equal(mockUser);
    expect(saveStub.calledOnce).to.be.true;
  });

  it("2. Should validate the email", async function () {
    user.email = "test@123@gmail.com";
    const mockError = new Error("database error");
    saveStub.rejects(mockError);

    try {
      await user.save();
    } catch (err) {
      expect(err).to.equal(mockError);
      expect(saveStub.calledOnce).to.be.true;
    }
  });
});
