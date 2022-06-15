const Base = require("./base");
const db = require("../models/index");

// Generate roles array
const getRoles = () => {
  const numOfPlayers = 3;
  const numOfWerevolves = Math.floor(numOfPlayers / 3);
  const roles = ["Werevolf", "Villager"];
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

let roles = [];

// Game logic
class Games extends Base {
  constructor(model) {
    super(model);
  }

  async showGameHall(req, res) {
    // const games = await this.model.findAll();
    const players = await this.model.findAll({ include: [db.UserGame] });
    const currentUser = res.locals.currentUser;
    res.render("gameHall", { games: players, currentUser: currentUser });
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

  async showGameRoom(req, res) {
    const game = await this.model.findByPk(req.params.id, {
      include: [
        {
          model: db.User,
          include: [db.UserGame],
        },
      ],
    });
    res.render("gameRoom", { game: game });
  }

  async getPlayers(req, res) {
    const gameId = req.params.id;
    const game = await this.model.findByPk(gameId, {
      include: [
        {
          model: db.User,
          include: [db.UserGame],
        },
      ],
    });

    res.json(game.users);
  }

  async joinGame(req, res) {
    const gameId = req.body.gameId;
    const currentUser = res.locals.currentUser;
    const game = await this.model.findByPk(gameId);
    const existingPlayer = await game.getUsers({
      where: {
        id: Number(currentUser.id),
      },
    });

    if (existingPlayer.length === 0) {
      if (roles.length === 0) roles = getRoles();
      const user = await db.User.findByPk(currentUser.id);
      await game.addUser(user, {
        through: {
          role: roles.pop(),
          alive: true,
          gameState: "Ready",
          // vote: "0",
        },
      });
      if (roles.length === 0) {
        game.game_state = "Night";
        await game.save();
      }
    }
    res.json({ gameId });
  }

  async getCurrentPlayerRole(req, res) {
    const gameId = req.params.id;
    const currentUser = res.locals.currentUser;
    const player = await db.UserGame.findOne({
      where: {
        gameId: gameId,
        userId: currentUser.id,
      },
    });
    res.send(`${player.role}`);
  }

  async postVote(req, res) {
    const gameId = req.params.id;
    const currentUser = res.locals.currentUser;
    const vote = req.body.vote;
    const user = await db.UserGame.findOne({
      where: {
        userId: currentUser.id,
      },
    });
    user.vote = vote;
    await user.save();
    res.send("Vote posted!");
  }

  async getVoteResult(req, res) {
    const gameId = req.params.id;
    // const currentUser = res.locals.currentUser;
    const players = await db.UserGame.findAll({
      where: {
        gameId: gameId,
      },
    });

    let voteArr = [];
    players.forEach((player) => {
      if (player.vote !== null) {
        voteArr.push(player.vote);
      }
    });
    console.log(voteArr);
    if (voteArr.length !== 1) {
      killedPlayerId = Math.floor(Math.random() * voteArr.length) + 1;
    }

    res.send("villager got killed by werevolf");
  }
}

module.exports = Games;
