const db = require("../models");
const Base = require("./base");

// Generate roles array
const getRoles = () => {
  const numOfPlayers = 3;
  const numOfWerevolves = numOfPlayers / 3;
  const roles = ["Werevolves", "Villagers"];
  const rolesArr = [];
  for (let i = 0; i < numOfWerevolves; i += 1) {
    rolesArr.push(roles[0]);
  }
  for (let i = 0; i < numOfPlayers - numOfWerevolves; i += 1) {
    rolesArr.push(roles[1]);
  }
  // Shuffle roles
  for (let i = rolesArr.length - 1; i > 0; i -= 1) {
    let idx = Math.floor(Math.random() * i);
    let temp = rolesArr[i];
    rolesArr[i] = rolesArr[idx];
    rolesArr[idx] = temp;
  }
  return rolesArr;
};
const assignRoles = getRoles();

class UserGames extends Base {
  constructor(model) {
    super(model);
  }

  async showGameRoom(req, res) {
    const getPlayers = await this.model.findAll({
      where: {
        gameId: Number(req.params.id),
      },
      include: [db.User, db.Game],
    });
    // console.log(getPlayers[0].gameState); // user_games table - gameState
    // console.log(getPlayers[0].game.name); // games table - name
    // console.log(getPlayers[0].user.displayName); // users table - displayName
    console.log(getPlayers);
    res.render("gameRoom", { players: getPlayers });
  }

  async joinGame(req, res) {
    const gameId = req.body.gameId;
    const currentUser = res.locals.currentUser;
    const existingPlayer = await this.model.findOne({
      where: {
        gameId: gameId,
        userId: Number(currentUser.id),
      },
    });

    if (!existingPlayer) {
      const userGameData = {
        role: assignRoles.pop(),
        alive: true,
        gameState: "Ready",
        gameId: Number(gameId),
        userId: Number(currentUser.id),
      };
      console.log(assignRoles);
      await this.model.create(userGameData);
    }
    console.log(assignRoles.length);
    if (assignRoles.length === 0) {
      console.log("game start: night");
    }
    res.send({ gameId });
  }
}

module.exports = UserGames;
