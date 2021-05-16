const { assert } = require('chai');

const { getUserByEmail, userCheck } = require('../helpers');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', () => {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedOutput = "userRandomID";
    // Write your assert statement here

    assert.equal(expectedOutput, user.id);
  });

  it("should return false if email that isnt in database is entered", () => {
    const user = getUserByEmail("heheh@gmail.com", testUsers);
    const expectedOutput = false;
    assert.equal(expectedOutput, user);
  });

});

describe("userCheck", () => {
  it('should return true if email is already in database', () => {
    const user = userCheck("user2@example.com", testUsers);
    const expectedOutput = true;

    assert.equal(expectedOutput, user);
  });

  it('should return false if email is not in datase', () => {
    const user = userCheck("hehehe@gmail.com", testUsers);
    const expectedOutput = false;

    assert.equal(expectedOutput, user);
  });
});