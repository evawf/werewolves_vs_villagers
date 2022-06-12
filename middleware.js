const jsSHA = require("jssha");
const SALT = process.env.MY_SALT;

//  Middleware for Login check
const getHash = (input) => {
  const shaObj = new jsSHA("SHA-512", "TEXT", { encoding: "UTF8" });
  const unhashedString = `${input}-${SALT}`;
  shaObj.update(unhashedString);
  return shaObj.getHash("HEX");
};

// app.use((req, res, next) => {
//   req.isUserLoggedIn = false;
//   res.locals.loggedIn = false;
//   if (req.cookies.loggedIn && req.cookies.userId) {
//     const hash = getHash(req.cookies.userId);
//     if (req.cookies.loggedIn === hash) {
//       const userQuery = `SELECT * FROM users WHERE id=$1`;
//       pool
//         .query(userQuery, [req.cookies.userId])
//         .then((userQueryResult) => {
//           if (userQueryResult.rows.length === 0) {
//             res.redirect("/login");
//             return;
//           }
//           let user = userQueryResult.rows[0];
//           req.user = userQueryResult.rows[0];
//           res.locals.currentUser = user;
//           req.isUserLoggedIn = true;
//           res.locals.loggedIn = true;
//           next();
//         })
//         .catch((error) => {
//           console.log("error", error);
//         });
//       return;
//     }
//   }
//   next();
// });

const isLoggedIn = async (req, res, next) => {
  if (req.isUserLoggedIn) {
    next();
    return;
  }
  await res.redirect("/login");
};

module.exports = isLoggedIn;
module.exports = getHash;
