const jwt = require("jsonwebtoken");
const privateKey = process.env.JWT_KEY;

jwtSign = async (payload) => {
  return jwt.sign(
    { username: payload.username, email: payload.email },
    privateKey
  );
};

jwtVerify = async (token) => {
  return jwt.verify(token, privateKey);
};

module.exports = { jwtSign, jwtVerify };
