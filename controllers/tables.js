const Base = require("./base");

class Tables extends Base {
  constructor(model) {
    super(model);
  }

  async showGameHall(req, res) {
    const tables = await this.model.findAll();
    console.log(tables);
    res.render("gameHall", { tables: tables });
  }

  async addNewTable(req, res) {
    const newTable = req.body;
    console.log(newTable);
    const result = await this.model.create(newTable);
    res.json(result);
  }
}

module.exports = Tables;
