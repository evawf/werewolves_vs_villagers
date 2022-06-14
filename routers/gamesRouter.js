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
      );
    // .get(
    //   "/:id/getPlayers",
    //   isLoggedIn,
    //   this.controller.getPlayers.bind(this.controller)
    // )
    return router;
  }
}

module.exports = gamesRouter;
