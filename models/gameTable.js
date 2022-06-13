const initGameTableModel = (sequelize, DataTypes) => {
  return sequelize.define(
    "gameTable",
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      role: {
        allowNull: false,
        type: DataTypes.TEXT,
      },
      alive: {
        allowNull: false,
        type: DataTypes.BOOLEAN,
      },
      gameState: {
        allowNull: false,
        type: DataTypes.TEXT,
      },
      tableId: {
        allowNull: false,
        type: DataTypes.INTEGER,
        references: {
          model: "tables",
          key: "id",
        },
      },
      userId: {
        allowNull: false,
        type: DataTypes.INTEGER,
        references: {
          model: "users",
          key: "id",
        },
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
    },
    {
      underscore: true,
    }
  );
};

module.exports = initGameTableModel;
