const Base = require("./base");
const db = require("../models/index");

// Generate roles array
const getRoles = () => {
  // const numOfPlayers = 3;
  // const numOfWerevolves = Math.floor(numOfPlayers / 3);
  // const roles = ["Werevolf", "Villager"];
  // const rolesArr = [];
  // for (let i = 0; i < numOfWerevolves; i += 1) {
  //   rolesArr.push(roles[0]);
  // }
  // for (let i = 0; i < numOfPlayers - numOfWerevolves; i += 1) {
  //   rolesArr.push(roles[1]);
  // }
  // let roles = ["Werewolf", "Villager", "Werewolf", "Villager", "Villager"];
  let roles = ["Werewolf", "Villager", "Villager"];
  // Shuffle roles
  for (let i = roles.length - 1; i > 0; i -= 1) {
    let idx = Math.floor(Math.random() * i);
    let temp = roles[i];
    roles[i] = roles[idx];
    roles[idx] = temp;
  }
  return roles;
};

// Game logic
class Games extends Base {
  constructor(model) {
    super(model);
  }

  async showGameHall(req, res) {
    const players = await this.model.findAll({ include: [db.UserGame] });
    const currentUser = res.locals.currentUser;
    res.render("gameHall", { games: players, currentUser: currentUser });
  }

  async getGamesInfo(req, res) {
    const games = await this.model.findAll();
    res.json({ games });
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
    const game = await this.model.findByPk(req.params.id);
    res.render("gameRoom", { game: game });
  }

  async getGameInfo(req, res) {
    const gameId = req.params.id;
    const currentUser = res.locals.currentUser;
    const game = await this.model.findByPk(gameId, {
      include: [
        {
          model: db.User,
          include: [db.UserGame],
        },
      ],
    });

    const gameInfo = {
      gameId: game.id,
      gameState: game.gameState,
      players: [],
    };
    gameInfo.players = game.users.map((p) => {
      const oneUser = {
        id: p.id,
        displayName: p.displayName,
        you: p.id == currentUser.id,
        role: p.id == currentUser.id ? p.userGame.role : null,
        alive: p.userGame.alive,
      };
      return oneUser;
    });

    res.json(gameInfo);
  }

  async joinGame(req, res) {
    const gameId = req.body.gameId;
    const currentUser = res.locals.currentUser;
    const game = await this.model.findByPk(gameId);
    if (game.gameState !== "Waiting") {
      return res.send("Game started");
    }
    const alreadyJoined = await game.getUsers({
      where: {
        id: Number(currentUser.id),
      },
    });

    if (alreadyJoined.length) return res.send("Joined!");

    // Check joined players' role and make a arr
    const joinedPlayers = await db.UserGame.findAll({
      where: {
        gameId: gameId,
      },
    });
    const existingRoles = [];
    joinedPlayers.forEach((player) => {
      existingRoles.push(player.role);
    });

    let roles = getRoles();
    existingRoles.forEach((r) => {
      if (roles.includes(r)) {
        const index = roles.indexOf(r);
        if (index > -1) {
          roles.splice(index, 1); // 2nd parameter means remove one item only
        }
      }
    });

    if (roles.length > 0) {
      const user = await db.User.findByPk(currentUser.id);
      await game.addUser(user, {
        through: {
          role: roles.pop(),
          alive: true,
          gameState: "Waiting",
        },
      });
    }
    const activePlayers = await db.UserGame.findAll({
      where: {
        gameId: gameId,
      },
    });
    if (activePlayers.length === 3) {
      game.gameState = "Night";
      await game.save();
    }
    res.send("Joined!");
  }

  async getGameState(req, res) {
    const gameId = req.params.id;
    const game = await this.model.findByPk(gameId);
    res.json({ game });
  }

  async getCurrentPlayer(req, res) {
    const gameId = req.params.id;
    const currentUser = res.locals.currentUser;
    const player = await db.UserGame.findOne({
      where: {
        gameId: gameId,
        userId: currentUser.id,
      },
    });
    res.json({ player });
  }

  async postVoteVillager(req, res) {
    const gameId = req.params.id;
    const game = await this.model.findByPk(gameId);

    if (game.gameState !== "Night") {
      res.send("Vote finisehd!");
      return;
    }

    const currentUser = res.locals.currentUser;
    const vote = req.body.vote;
    const user = await db.UserGame.findOne({
      where: {
        userId: currentUser.id,
        gameId: gameId,
      },
    });
    user.vote = vote;
    await user.save();

    // check if every werewolves have voted

    const werewolves = await game.getUserGames({
      where: {
        alive: true,
        role: "Werewolf",
      },
    });

    let allVoted = true;
    let votes = {};
    let maxCount = 0;
    let selected = null;
    werewolves.forEach((w) => {
      if (w.vote) {
        if (votes[w.vote] == null) votes[w.vote] = 1;
        else votes[w.vote]++;

        if (votes[w.vote] === maxCount) {
          selected.push(w.vote);
        }
        if (votes[w.vote] > maxCount) {
          selected = [w.vote];
          maxCount = votes[w.vote];
        }
      } else {
        allVoted = false;
      }
    });

    if (allVoted) {
      //All werewolves have voted, switch to day mode
      let toKill = selected.pop();
      const user = await db.UserGame.findOne({
        where: {
          userId: Number(toKill),
          gameId: gameId,
        },
        include: [db.User, db.Game],
      });
      user.alive = false;
      await user.save();

      // Check Win
      const playersObj = { Villager: 0, Werewolf: 0 };
      const activePlayers = await game.getUserGames({
        where: {
          alive: true,
        },
      });
      activePlayers.forEach((player) => {
        if (player.role === "Villager") {
          playersObj.Villager += 1;
        }
        if (player.role === "Werewolf") {
          playersObj.Werewolf += 1;
        }
      });

      if (playersObj.Villager === 0 || playersObj.Werewolf === 0) {
        game.gameState = "Game over";
        await game.save();
      } else {
        const activePlayers = await game.getUserGames({
          where: {
            alive: true,
          },
        });
        activePlayers.forEach(async (player) => {
          player.vote = null;
          await player.save();
        });
        game.gameState = "Day";
        await game.save();
      }
    }
    res.send("Vote posted!");
  }

  async getGamePlayers(req, res) {
    const gameId = req.params.id;
    const players = await db.UserGame.findAll({
      where: {
        gameId: gameId,
        alive: true,
      },
      include: [db.User],
    });
    const playersArr = [];
    players.forEach((player) => {
      playersArr.push({
        userId: player.user.id,
        role: player.role,
        alive: player.alive,
      });
    });
    res.json(playersArr);
  }

  async postVoteWerewolf(req, res) {
    const gameId = req.params.id;
    const game = await this.model.findByPk(gameId);

    if (game.gameState !== "Day") {
      res.send("Vote finisehd!");
      return;
    }

    const currentUser = res.locals.currentUser;
    const vote = req.body.vote;
    const user = await db.UserGame.findOne({
      where: {
        userId: currentUser.id,
        gameId: gameId,
      },
    });
    user.vote = vote;
    await user.save();

    //check if everyone have voted
    const allPlayers = await game.getUserGames({
      where: {
        alive: true,
      },
    });

    let allVoted = true;
    let votes = {};
    let maxCount = 0;
    let selected = null;
    allPlayers.forEach((p) => {
      if (p.vote) {
        if (votes[p.vote] == null) votes[p.vote] = 1;
        else votes[p.vote]++;

        if (votes[p.vote] === maxCount) {
          selected.push(p.vote);
        }
        if (votes[p.vote] > maxCount) {
          selected = [p.vote];
          maxCount = votes[p.vote];
        }
      } else {
        allVoted = false;
      }
    });

    if (allVoted) {
      //All werewolves have voted, switch to day mode
      let toKill = selected.pop();
      const user = await db.UserGame.findOne({
        where: {
          userId: Number(toKill),
          gameId: gameId,
        },
        include: [db.User, db.Game],
      });
      user.alive = false;
      await user.save();

      // Check Win
      const playersObj = { Villager: 0, Werewolf: 0 };
      const activePlayers = await game.getUserGames({
        where: {
          alive: true,
        },
      });
      activePlayers.forEach((player) => {
        if (player.role === "Villager") {
          playersObj.Villager += 1;
        }
        if (player.role === "Werewolf") {
          playersObj.Werewolf += 1;
        }
      });

      if (playersObj.Villager === 0 || playersObj.Werewolf === 0) {
        game.gameState = "Game over";
        await game.save();
      } else {
        const activePlayers = await game.getUserGames({
          where: {
            alive: true,
          },
        });
        activePlayers.forEach(async (player) => {
          player.vote = null;
          await player.save();
        });
        game.gameState = "Night";
        await game.save();
      }
    }
    res.send("Vote posted!");
  }

  async initGame(req, res) {
    const gameId = req.params.id;
    const game = await this.model.findByPk(gameId);
    const players = await game.getUserGames();

    console.log("all players: ", players);
    players.forEach(async (player) => {
      await player.destroy();
    });

    res.send("Game over!");
  }

  async quitGame(req, res) {
    const gameId = req.params.id;
    const currentUser = res.locals.currentUser;
    const leavedPlayer = await db.UserGame.findOne({
      where: {
        gameId: gameId,
        userId: currentUser.id,
      },
      include: [db.User],
    });

    // Remove player from game
    await leavedPlayer.destroy();

    const game = await this.model.findByPk(gameId);
    const activePlayers = await db.UserGame.findAll({
      where: {
        gameId: gameId,
      },
    });

    res.json({ leavedPlayer });
  }
}

module.exports = Games;
