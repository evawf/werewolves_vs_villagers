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
        "/games/:id",
        isLoggedIn,
        this.controller.showGameRoom.bind(this.controller)
      )
      .post(
        "/games/joinGame",
        isLoggedIn,
        this.controller.joinGame.bind(this.controller)
      )
      .get(
        "/games/:id/getPlayers",
        isLoggedIn,
        this.controller.getPlayers.bind(this.controller)
      )
      .get(
        "/games/:id/getCurrentPlayerRole",
        isLoggedIn,
        this.controller.getCurrentPlayerRole.bind(this.controller)
      )
      .post(
        "/games/:id/vote",
        isLoggedIn,
        this.controller.postVote.bind(this.controller)
      )
      .get(
        "/games/:id/voteResult",
        isLoggedIn,
        this.controller.getVoteResult.bind(this.controller)
      );
    return router;
  }
}

module.exports = gamesRouter;
