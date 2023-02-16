const bcrypt = require("bcrypt");

bcryptHash = async (password) => {
  return bcrypt.hash(password, 10);
};

bcryptCompare = async (password, hasPwd) => {
  return bcrypt.compare(password, hasPwd);
};

module.exports = { bcryptHash, bcryptCompare };
