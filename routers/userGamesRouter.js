const express = require("express");
const router = express.Router();
const { isLoggedIn } = require("../middleware");

class userGamesRouter {
  constructor(controller) {
    this.controller = controller;
  }

  router() {
    router
      .get(
        "/:id",
        isLoggedIn,
        this.controller.showGameRoom.bind(this.controller)
      )

      .post(
        "/joinGame",
        isLoggedIn,
        this.controller.joinGame.bind(this.controller)
      );
    return router;
  }
}

module.exports = userGamesRouter;
