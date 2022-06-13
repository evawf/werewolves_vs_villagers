"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.removeColumn("tables", "game_state", Sequelize.TEXT);
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.addColumn("tables", "game_state");
  },
};
