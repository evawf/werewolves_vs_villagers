const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const methodOverride = require("method-override");
const jsSHA = require("jssha");
const dotenv = require("dotenv");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(methodOverride("_method"));
app.use(cookieParser());

if (process.env.ENV !== "production") {
  dotenv.config();
}

// Import db
const db = require("./models/index");

// Import controllers
const Users = require("./controllers/users");

// Initializing controllers
const usersController = new Users(db.User);

// Import routers
const UsersRouter = require("./routers/usersRouter");

// Initializing routers
const usersRouter = new UsersRouter(usersController).router();

const SALT = process.env.MY_SALT;
// user auth middleware
app.use((req, res, next) => {
  req.isUserLoggedIn = false;
  res.locals.loggedIn = false;
  if (req.cookies.loggedIn && req.cookies.userId) {
    const hash = getHash(req.cookies.userId);
    if (req.cookies.loggedIn === hash) {
      const userQuery = `SELECT * FROM users WHERE id=$1`;
      pool
        .query(userQuery, [req.cookies.userId])
        .then((userQueryResult) => {
          if (userQueryResult.rows.length === 0) {
            res.redirect("/login");
            return;
          }
          let user = userQueryResult.rows[0];
          req.user = userQueryResult.rows[0];
          res.locals.currentUser = user;
          req.isUserLoggedIn = true;
          res.locals.loggedIn = true;
          next();
        })
        .catch((error) => {
          console.log("error", error);
        });
      return;
    }
  }
  next();
});

app.use("/", usersRouter);

const PORT = process.env.PORT || 8088;
app.listen(PORT, () => {
  console.log(`App is listening on port ${PORT}!`);
});
