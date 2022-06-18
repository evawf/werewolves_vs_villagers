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
  // // Shuffle roles
  // for (let i = rolesArr.length - 1; i > 0; i -= 1) {
  //   let idx = Math.floor(Math.random() * i);
  //   let temp = rolesArr[i];
  //   rolesArr[i] = rolesArr[idx];
  //   rolesArr[idx] = temp;
  // }
  // return rolesArr;
  return ["Werewolf", "Villager", "Villager"];
};

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
    if (roles.length === 0) {
      game.game_state = "Night";
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
    res.send("Vote posted!");
  }

  async getVoteVillagerResult(req, res) {
    const gameId = req.params.id;
    const activePlayers = await db.UserGame.findAll({
      where: {
        gameId: gameId,
        alive: true,
      },
    });

    let voteArr = [];
    activePlayers.forEach((player) => {
      if (player.vote !== null) {
        voteArr.push(player.vote);
      }
    });

    let user;
    if (voteArr.length === 1) {
      // replace 1 to num of werewolf for more players
      user = await db.UserGame.findOne({
        where: {
          userId: Number(voteArr[0]),
          gameId: gameId,
        },
        include: [db.User, db.Game],
      });
      user.alive = false;
      await user.save();
    }
    // Check if active players > 1, if YES switch to "Day" mode, else switch to "Gameover"
    if (activePlayers.length > 1 && voteArr.length === 1) {
      // replace 1 to num of werewolf for more players
      const game = await this.model.findByPk(gameId);
      game.game_state = "Day";
      await game.save();
    }

    // Check Win
    const playersObj = { Villager: 0, Werewolf: 0 };
    activePlayers.forEach((player) => {
      if (player.role === "Villager") {
        playersObj.Villager += 1;
      }
      if (player.role === "Werewolf") {
        playersObj.Werewolf += 1;
      }
    });

    if (playersObj.Villager === 0 || playersObj.Werewolf === 0) {
      const game = await db.Game.findByPk(gameId);
      game.game_state = "Game over";
      await game.save();
    }
    res.json({ user });
  }

  async getActivePlayers(req, res) {
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
      playersArr.push(player.user);
    });
    res.json({ playersArr, players });
  }

  async postVoteWerewolf(req, res) {
    const gameId = req.params.id;
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
    res.send("voted!");
  }

  async getVoteWerewolfResult(req, res) {
    const gameId = req.params.id;
    const activePlayers = await db.UserGame.findAll({
      where: {
        gameId: gameId,
        alive: true,
      },
    });
    // Collect vote
    const voteArr = [];
    activePlayers.forEach((player) => {
      if (player.vote !== null) {
        voteArr.push(Number(player.vote));
      }
    });

    // If all active players voted, then decide who will be killed
    let user;
    if (voteArr.length === activePlayers.length) {
      // If only tow active players, then random choose who gets killed
      let idx = Math.floor(Math.random() * voteArr.length);
      user = await db.UserGame.findOne({
        where: {
          userId: voteArr[idx],
          gameId: gameId,
        },
        include: [db.User, db.Game],
      });
      user.alive = false;
      await user.save();
      // If more active players, then higher votes player gets killed
      // .... to be added here
      // }

      if (activePlayers.length > 1 && voteArr.length === activePlayers.length) {
        const game = await db.Game.findByPk(gameId);
        game.game_state = "Night";
        await game.save();
      }

      // Check Win
      const playersObj = { Villager: 0, Werewolf: 0 };
      activePlayers.forEach((player) => {
        if (player.role === "Villager") {
          playersObj.Villager += 1;
        }
        if (player.role === "Werewolf") {
          playersObj.Werewolf += 1;
        }
      });

      if (playersObj.Villager === 0 || playersObj.Werewolf === 0) {
        const game = await db.Game.findByPk(gameId);
        game.game_state = "Game over";
        await game.save();
      }

      res.json({ user });
    }
  }

  async restartGame(req, res) {
    const gameId = req.params.id;
    const gamePlayers = await db.UserGame.findAll({
      where: {
        gameId: gameId,
      },
    });

    const roles = getRoles();
    gamePlayers.forEach(async (player) => {
      await db.UserGame.update(
        {
          vote: null,
          alive: true,
          role: roles.pop(),
        },
        {
          where: {
            userId: player.userId,
            gameId: gameId,
          },
        }
      );
    });

    const game = await this.model.findByPk(gameId);
    game.game_state = "Night";
    await game.save();
    res.send("Night");
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
    await leavedPlayer.destroy();
    res.json({ leavedPlayer });
  }
}

module.exports = Games;
