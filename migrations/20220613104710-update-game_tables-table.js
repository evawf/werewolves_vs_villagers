"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.addColumn(
      "game_tables",
      "game_state",
      Sequelize.TEXT
    );
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.removeColumn("game_tables", "game_state");
  },
};
