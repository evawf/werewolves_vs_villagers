const jsSHA = require("jssha");
const SALT = process.env.MY_SALT;

//  Middleware for Login check
const getHash = (input) => {
  const shaObj = new jsSHA("SHA-512", "TEXT", { encoding: "UTF8" });
  const unhashedString = `${input}-${SALT}`;
  shaObj.update(unhashedString);
  return shaObj.getHash("HEX");
};

const isLoggedIn = (req, res, next) => {
  if (req.isUserLoggedIn) {
    next();
    return;
  }
  res.redirect("/");
};

module.exports = { isLoggedIn, getHash };
