const dotenv = require("dotenv");

if (process.env.ENV !== "production") {
  dotenv.config();
}

const express = require("express");
const app = express();
/********************************************/
/********  Socket.IO    *********************/
/********************************************/
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
/********************************************/

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

// Initializing controllers
const usersController = new Users(db.User);
const gamesController = new Games(db.Game);

// Import routers
const UsersRouter = require("./routers/usersRouter");
const GamesRouter = require("./routers/gamesRouter");

// Initializing routers
const usersRouter = new UsersRouter(usersController).router();
const gamesRouter = new GamesRouter(gamesController).router();

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

const PORT = process.env.PORT || 8088;

// app.listen(PORT, () => {
//   console.log(`App is listening on port ${PORT}!`);
// });

io.on("connection", (socket) => {
  socket.on("join", (data) => {
    // console.log(data);
    console.log("will join room " + data.game);
    socket.join(data.game);
    for (const room of socket.rooms) {
      if (room !== socket.id) {
        io.to(data.game).emit(
          "chat message",
          data.userName + " has joined game " + data.game
        );
      }
    }
  });

  socket.on("chat message", (msg) => {
    console.log(msg);
    for (const room of socket.rooms) {
      if (room !== socket.id) {
        io.to(room).emit("chat message", msg); // Send message to everyone including the sender
      }
    }
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
    for (const room of socket.rooms) {
      if (room !== socket.id) {
        io.to(room).emit("chat message", "A user disconnected"); // Send message to everyone including the sender
      }
    }
  });
});

server.listen(PORT, () => {
  console.log(`App is listening on port ${PORT}!`);
});
