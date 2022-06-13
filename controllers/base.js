const db = require("../models/index");

class Base {
  constructor(model) {
    this.model = model;
  }
}

module.exports = Base;
