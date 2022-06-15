const initUserGameModel = (sequelize, DataTypes) => {
  return sequelize.define(
    "userGame",
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
      vote: {
        allowNull: true,
        type: DataTypes.TEXT,
      },
      gameId: {
        allowNull: false,
        type: DataTypes.INTEGER,
        references: {
          model: "games",
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
      // createdAt: {
      //   allowNull: false,
      //   type: DataTypes.DATE,
      // },
      // updatedAt: {
      //   allowNull: false,
      //   type: DataTypes.DATE,
      // },
    },
    {
      underscored: true,
    }
  );
};

module.exports = initUserGameModel;
