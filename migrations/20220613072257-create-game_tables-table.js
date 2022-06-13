"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("game_tables", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      role: {
        allowNull: false,
        type: Sequelize.TEXT,
      },
      alive: {
        allowNull: false,
        type: Sequelize.BOOLEAN,
      },
      table_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: "tables",
          key: "id",
        },
      },
      user_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: "users",
          key: "id",
        },
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("game_tables");
  },
};
