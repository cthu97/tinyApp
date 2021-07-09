const bcrypt = require('bcryptjs');

const getUserByEmail = (users, email) => {
  for (const userID in users) {
    const user = users[userID];
    if (user.email === email) {
      return user.id;
    }
  }
  return null;
};


module.exports = { getUserByEmail }