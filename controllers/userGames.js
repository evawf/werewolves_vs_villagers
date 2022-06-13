const Base = require("./base");

class UserGames extends Base {
  constructor(model) {
    super(model);
  }

  showGameRoom(req, res) {
    res.render("gameRoom");
  }

  async joinGame(req, res) {
    const gameId = req.body.gameId;
    const currentUser = res.locals.currentUser;
    const userGameData = {
      role: "Werewolf",
      alive: true,
      gameState: "Ready",
      gameId: Number(gameId),
      userId: Number(currentUser.id),
    };

    await this.model.create(userGameData);
    res.send("Joined!");
  }
}

module.exports = UserGames;
