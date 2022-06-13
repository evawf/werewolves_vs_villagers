const express = require("express");
const router = express.Router();
const { isLoggedIn } = require("../middleware");

class TablesRouter {
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
        "/newTable",
        isLoggedIn,
        this.controller.addNewTable.bind(this.controller)
      );
    return router;
  }
}

module.exports = TablesRouter;
