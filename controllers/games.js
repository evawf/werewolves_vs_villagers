const Base = require("./base");

class Games extends Base {
  constructor(model) {
    super(model);
  }

  async showGameHall(req, res) {
    const games = await this.model.findAll();
    const currentUser = res.locals.currentUser;
    res.render("gameHall", { games: games, currentUser: currentUser });
  }

  async addNewGame(req, res) {
    const newGame = req.body;
    console.log(newGame);
    const result = await this.model.create(newGame);
    res.json(result);
  }

  getCurrentUser(req, res) {
    const currentUser = res.locals.currentUser;
    res.json(currentUser);
  }

  showGameRoom(req, res) {
    const gameId = req.param;
    console.log(gameId);
    res.render("gameRoom");
  }
}

module.exports = Games;
