const express = require("express");
const router = express.Router();
const { isLoggedIn } = require("../middleware");

class gamesRouter {
  constructor(controller) {
    this.controller = controller;
  }

  router() {
    router
      .get(
        "/gameHall",
        isLoggedIn,
        this.controller.showGameHall.bind(this.controller)
      )
      .post(
        "/newGame",
        isLoggedIn,
        this.controller.addNewGame.bind(this.controller)
      )
      .get(
        "/currentUser",
        isLoggedIn,
        this.controller.getCurrentUser.bind(this.controller)
      )
      .get(
        "/getGamesInfo",
        isLoggedIn,
        this.controller.getGamesInfo.bind(this.controller)
      )
      .get(
        "/games/:id",
        isLoggedIn,
        this.controller.showGameRoom.bind(this.controller)
      )
      .get(
        "/games/:id/info",
        isLoggedIn,
        this.controller.getGameInfo.bind(this.controller)
      )
      .post(
        "/games/joinGame",
        isLoggedIn,
        this.controller.joinGame.bind(this.controller)
      )
      .get(
        "/games/:id/getCurrentPlayer",
        isLoggedIn,
        this.controller.getCurrentPlayer.bind(this.controller)
      )
      .get(
        "/games/:id/gameState",
        isLoggedIn,
        this.controller.getGameState.bind(this.controller)
      )
      .post(
        "/games/:id/voteVillager",
        isLoggedIn,
        this.controller.postVoteVillager.bind(this.controller)
      )
      .get(
        "/games/:id/players",
        isLoggedIn,
        this.controller.getGamePlayers.bind(this.controller)
      )
      .post(
        "/games/:id/voteWereWolf",
        isLoggedIn,
        this.controller.postVoteWerewolf.bind(this.controller)
      )
      .post(
        "/games/:id/init",
        isLoggedIn,
        this.controller.initGame.bind(this.controller)
      )
      .post(
        "/games/:id/quitGame",
        isLoggedIn,
        this.controller.quitGame.bind(this.controller)
      )
      .post(
        "/games/:id/delete",
        isLoggedIn,
        this.controller.deletGame.bind(this.controller)
      );
    return router;
  }
}

module.exports = gamesRouter;
