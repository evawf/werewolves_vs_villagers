const express = require("express");
const router = express.Router();

class UsersRouter {
  constructor(controller) {
    this.controller = controller;
  }

  router() {
    router.get("/", this.controller.showHome.bind(this.controller));
  }
}

module.exports = UsersRouter;
