const Base = require("./base");
const db = require("../models/index");

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
    const result = await this.model.create(newGame);
    res.json(result);
  }

  getCurrentUser(req, res) {
    const currentUser = res.locals.currentUser;
    res.json(currentUser);
  }

  // showGameRoom(req, res) {
  //   res.render("gameRoom");
  // }

  // async joinGame(req, res) {
  //   const gameId = req.body.gameId;
  //   const currentUser = res.locals.currentUser;
  //   console.log(currentUser.id);
  //   console.log(gameId);
  //   const userGameData = {
  //     role: "Werewolf",
  //     alive: true,
  //     gameState: "Ready",
  //     gameId: Number(gameId),
  //     userId: Number(currentUser.id),
  //   };
  //   await db.UserGame.create(userGameData);
  //   res.send("Joined!");
  // }
}

module.exports = Games;
