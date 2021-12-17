const bcrypt = require("bcryptjs");

const users = {};
const urlDatabase = {};

const getUserByEmail = (users, email) => {
  for (const userID in users) {
    const user = users[userID];
    if (user.email === email) {
      return user.id;
    }
  }
  return null;
};

const generateRandomString = () => {
  return Math.random().toString(36).substring(7);
};

const urlsForUser = (id) => {
  const userURLS = {};
  for (const shortURL in urlDatabase) {
    const urlData = urlDatabase[shortURL];
    if (urlData.userID === id) {
      userURLS[shortURL] = urlData;
    }
  }
  return userURLS;
};

//authenticates correct user login
const UserLogin = (email, password) => {
  const user = getUserByEmail(users, email);
  if (user && bcrypt.compareSync(password, user.password)) {
    return user.id;
  } else {
    return null;
  }
};

module.exports = {
  getUserByEmail,
  generateRandomString,
  UserLogin,
  urlsForUser,
  urlDatabase,
  users,
};
