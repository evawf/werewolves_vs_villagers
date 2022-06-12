const Base = require("./base");
const jsSHA = require("jssha");
const getHash = require("../middleware");

class Users extends Base {
  constructor(model) {
    super(model);
  }

  showHome(req, res) {
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
        console.log("existing user!");
        res.redirect("/");
      } else {
        const result = await this.model.create(user);
        res.redirect("/");
      }
    } catch (error) {
      console.log("Error message:", error);
      res.status(404).render("error", { error: "Unable to add user!" });
    }
  }

  async loginUser(req, res) {
    if (req.isUserLoggedIn === true) {
      res.redirect("/gameHall");
      return;
    }
    try {
      const user = await this.model.findOne({
        where: {
          email: req.body.email,
        },
      });
      // User auth
      if (!user) {
        res.status(403).render("error", {
          error: "User is not found, please sign up first!",
        });
        return;
      }
      // Check user password
      const shaObj = new jsSHA("SHA-512", "TEXT", { encoding: "UTF8" });
      shaObj.update(req.body.password);
      const hashedPassword = shaObj.getHash("HEX");
      if (user.password !== hashedPassword) {
        res
          .status(401)
          .render("error", { error: "Wrong password! Please try again!" });
        return;
      } else {
        // Generate the hashed cookie value
        const shaObj1 = new jsSHA("SHA-512", "TEXT", { encoding: "UTF8" });
        const unhashedCookieString = `${user.id}-${SALT}`;
        shaObj1.update(unhashedCookieString);
        const hashedCookieString = shaObj1.getHash("HEX");

        res.cookie("loggedIn", hashedCookieString);
        res.cookie("userId", user.id);
        res.redirect("gameHall");
        return;
      }
    } catch (error) {
      res.status(400).render("error", { error: "Bad request" });
    }
  }

  showGameHall(req, res) {
    res.render("gameHall");
  }
}

module.exports = Users;
