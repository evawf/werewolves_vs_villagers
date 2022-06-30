const Base = require("./base");
const jsSHA = require("jssha");
const { getHash } = require("../middleware");
const SALT = process.env.MY_SALT;

class Users extends Base {
  constructor(model) {
    super(model);
  }

  showHome(req, res) {
    if (req.isUserLoggedIn === true) {
      res.redirect("/gameHall");
      return;
    }
    res.render("home");
  }

  async addUser(req, res) {
    const shaObj = new jsSHA("SHA-512", "TEXT", { encoding: "UTF8" });
    shaObj.update(req.body.password);
    const hashedPassword = shaObj.getHash("HEX");
    const user = {
      displayName: req.body.displayName,
      email: req.body.email,
      password: hashedPassword,
    };
    try {
      const existingUser = await this.model.findOne({
        where: {
          email: user.email,
        },
      });
      if (existingUser) {
        res.send("Existing user!");
      } else {
        const result = await this.model.create(user);
        res.redirect("/");
      }
    } catch (error) {
      console.log("Error message:", error);
      res.status(404).json({ error: "Unable to add user!" });
    }
  }

  async loginUser(req, res) {
    try {
      const user = await this.model.findOne({
        where: {
          email: req.body.email,
        },
      });
      // User auth
      if (!user) {
        res.send("User is not found, please sign up first!");
        return;
      }
      // Check user password
      const shaObj = new jsSHA("SHA-512", "TEXT", { encoding: "UTF8" });
      shaObj.update(req.body.password);
      const hashedPassword = shaObj.getHash("HEX");
      if (user.password !== hashedPassword) {
        res.send("Wrong password! Please try again!");
        return;
      } else {
        // Generate the hashed cookie value
        const shaObj1 = new jsSHA("SHA-512", "TEXT", { encoding: "UTF8" });
        const unhashedCookieString = `${user.id}-${SALT}`;
        shaObj1.update(unhashedCookieString);
        const hashedCookieString = shaObj1.getHash("HEX");

        res.cookie("loggedIn", hashedCookieString);
        res.cookie("userId", user.id);
        res.json({ loggedIn: true });
        return;
      }
    } catch (error) {
      res.send("Unauthoried user!");
    }
  }

  logoutUser(req, res) {
    res.clearCookie("loggedIn").clearCookie("userId").redirect("/");
  }
}

module.exports = Users;
