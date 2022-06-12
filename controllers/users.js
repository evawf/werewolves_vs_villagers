const Base = require("./base");

class Users extends Base {
  constructor(model) {
    super(model);
  }

  showHome(req, res) {
    res.render("home");
  }
}

module.exports = Users;
