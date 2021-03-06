const Base = require("./base");
const db = require("../models/index");

// Generate roles array
const numOfPlayers = 4;
const getRoles = () => {
  // const numOfWerevolves = Math.floor(numOfPlayers / 3);
  // const roles = ["Werevolf", "Villager"];
  // const rolesArr = [];
  // for (let i = 0; i < numOfWerevolves; i += 1) {
  //   rolesArr.push(roles[0]);
  // }
  // for (let i = 0; i < numOfPlayers - numOfWerevolves; i += 1) {
  //   rolesArr.push(roles[1]);
  // }
  let roles = ["Werewolf", "Villager", "Villager", "Villager"]; // Dev mode: 4 players

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
    try {
      const games = await this.model.findAll({
        include: [db.UserGame],
        order: [["updatedAt", "DESC"]],
      });
      if (games === undefined) {
      } else {
        res.json({ games });
      }
    } catch (error) {
      console.log("Error message: ", error);
      res.send("No game");
    }
  }

  async addNewGame(req, res) {
    const newGame = req.body;
    try {
      const result = await this.model.create(newGame);
      res.json({ result });
    } catch (error) {
      console.log("Error message: ", error);
    }
  }

  getCurrentUser(req, res) {
    const currentUser = res.locals.currentUser;
    res.json(currentUser);
  }

  async showGameRoom(req, res) {
    try {
      const game = await this.model.findByPk(req.params.id);
      res.render("gameRoom", { game: game });
    } catch (error) {
      console.log("Error message: ", error);
    }
  }

  async getGameInfo(req, res) {
    const gameId = req.params.id;
    const currentUser = res.locals.currentUser;
    try {
      const game = await this.model.findByPk(gameId, {
        include: [
          {
            model: db.User,
            include: [db.UserGame],
          },
        ],
      });

      // if state == Night or state == Day and player is not active for more that 5 mintues then game over
      if (game.gameState === "Night" || game.gameState === "Day") {
        if (
          new Date().getMinutes() - game.gamestatechangedAt.getMinutes() >
          5
        ) {
          game.gameState = "Game over";
          game.gamestatechangedAt = null;
          console.log("two minutes passed: ", game.gameState);
          await game.save();
        }
      }

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
    } catch (error) {
      console.log("Error message: ", error);
    }
  }

  async joinGame(req, res) {
    const gameId = req.body.gameId;
    const currentUser = res.locals.currentUser;
    try {
      const game = await this.model.findByPk(gameId);
      const players = await game.getUserGames();
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

      if (players.length < numOfPlayers) {
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
      if (activePlayers.length === numOfPlayers) {
        game.gameState = "Night";
        game.gamestatechangedAt = new Date();
        await game.save();
      }
      res.send("Joined!");
    } catch (error) {
      console.log("Error message: ", error);
    }
  }

  async getGameState(req, res) {
    const gameId = req.params.id;
    try {
      const game = await this.model.findByPk(gameId);
      res.json({ game });
    } catch (error) {
      console.log("Error message: ", error);
    }
  }

  async getCurrentPlayer(req, res) {
    const gameId = req.params.id;
    const currentUser = res.locals.currentUser;
    try {
      const player = await db.UserGame.findOne({
        where: {
          gameId: gameId,
          userId: currentUser.id,
        },
      });
      res.json({ player });
    } catch (error) {
      console.log("Error message: ", error);
    }
  }

  async postVoteVillager(req, res) {
    const gameId = req.params.id;
    try {
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
          game.gamestatechangedAt = new Date();
          await game.save();
        }
      }
      res.send("Vote posted!");
    } catch (error) {
      console.log("Error message: ", error);
    }
  }

  async getGamePlayers(req, res) {
    const gameId = req.params.id;
    try {
      const players = await db.UserGame.findAll({
        where: {
          gameId: gameId,
          // alive: true,
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
    } catch (error) {
      console.log("Error message: ", error);
    }
  }

  async postVoteWerewolf(req, res) {
    const gameId = req.params.id;
    try {
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
          game.gamestatechangedAt = new Date();
          await game.save();
        }
      }
      res.send("Vote posted!");
    } catch (error) {
      console.log("Error message: ", error);
    }
  }

  async initGame(req, res) {
    const gameId = req.params.id;
    try {
      const game = await this.model.findByPk(gameId);
      const players = await game.getUserGames();
      players.forEach(async (player) => {
        await player.destroy();
      });

      game.gameState = "Waiting";
      game.gamestatechangedAt = null;
      await game.save();
      res.send("Game over!");
    } catch (error) {
      console.log("Error message: ", error);
    }
  }

  async quitGame(req, res) {
    const gameId = req.params.id;
    const currentUser = res.locals.currentUser;
    try {
      const leavedPlayer = await db.UserGame.findOne({
        where: {
          gameId: gameId,
          userId: currentUser.id,
        },
        include: [db.User],
      });

      // Remove player from game
      await leavedPlayer.destroy();
      res.json({ leavedPlayer });
    } catch (error) {
      console.log("Error message: ", error);
    }
  }

  async deletGame(req, res) {
    const gameId = Number(req.params.id);
    try {
      const game = await this.model.findByPk(gameId);
      console.log("game info: ", game);

      await game.destroy();
      res.send("Game deleted!");
    } catch (error) {
      console.log("Error message: ", error);
      res.send("Room can't be deleted.");
    }
  }
}

module.exports = Games;
