const generateRandomString = function() {
  return Math.random().toString(36).slice(2, 8);
};

const getUserByEmail = function(email, users) {
  for (let userId in users) {
    if (users[userId].email === email) {
      return users[userId];
    }
  }
  return false;
};

const userCheck = function(email, users) {
  for (let userId in users) {
    if (users[userId].email === email) {
      return true;
    }
  }
  return false;
};

module.exports = { getUserByEmail, generateRandomString, userCheck };