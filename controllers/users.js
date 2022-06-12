const Base = require("./base");

class Users extends Base {
  constructor(model) {
    super(model);
  }

  showHome(req, res) {
    res.render("home");
  }

  async addUser(req, res) {
    const user = req.body;
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
    } catch (err) {
      console.log("Error message:", err);
      res.status(404).send("Unable to add user!");
    }
  }
}

module.exports = Users;
