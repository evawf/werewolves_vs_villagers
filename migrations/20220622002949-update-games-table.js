"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("games", "gamestatechanged_at", {
      allowNull: true,
      type: Sequelize.DATE,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("games", "gamestatechanged_at");
  },
};
