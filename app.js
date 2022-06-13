const dotenv = require("dotenv");

if (process.env.ENV !== "production") {
  dotenv.config();
}

const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const methodOverride = require("method-override");
const jsSHA = require("jssha");
const { getHash } = require("./middleware");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(methodOverride("_method"));
app.use(cookieParser());

// Import db
const db = require("./models/index");

// Import controllers
const Users = require("./controllers/users");
const Games = require("./controllers/games");
const UserGames = require("./controllers/userGames");

// Initializing controllers
const usersController = new Users(db.User);
const gamesController = new Games(db.Game);
const userGamesController = new UserGames(db.UserGame);

// Import routers
const UsersRouter = require("./routers/usersRouter");
const GamesRouter = require("./routers/gamesRouter");
const UserGamesRouter = require("./routers/userGamesRouter");

// Initializing routers
const usersRouter = new UsersRouter(usersController).router();
const gamesRouter = new GamesRouter(gamesController).router();
const userGamesRouter = new UserGamesRouter(userGamesController).router();

const SALT = process.env.MY_SALT;

// user auth middleware
app.use(async (req, res, next) => {
  req.isUserLoggedIn = false;
  res.locals.loggedIn = false;

  if (req.cookies.loggedIn && req.cookies.userId) {
    const hash = getHash(req.cookies.userId);
    if (req.cookies.loggedIn === hash) {
      try {
        const result = await db.User.findOne({
          where: {
            id: req.cookies.userId,
          },
        });
        if (!result) {
          res.status(503).render("error", { error: "User is not found!" });
          // res.redirect("/");
          return;
        }
        let user = result;
        req.user = result;
        res.locals.currentUser = user;
        req.isUserLoggedIn = true;
        res.locals.loggedIn = true;
        next();
      } catch (error) {
        console.log("error", error);
      }
      return;
    }
  }
  next();
});

app.use("/", usersRouter);
app.use("/", gamesRouter);
app.use("/games", userGamesRouter);

const PORT = process.env.PORT || 8088;
app.listen(PORT, () => {
  console.log(`App is listening on port ${PORT}!`);
});
