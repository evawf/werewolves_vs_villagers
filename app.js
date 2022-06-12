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

const SALT = process.env.MY_SALT;

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

app.use("/", usersRouter);

const PORT = process.env.PORT || 8088;
app.listen(PORT, () => {
  console.log(`App is listening on port ${PORT}!`);
});
