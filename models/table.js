const initTableModel = (sequelize, Datatypes) => {
  return sequelize.define(
    "table",
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Datatypes.INTEGER,
      },
      name: {
        allowNull: false,
        type: Datatypes.TEXT,
      },
      gameState: {
        allowNull: false,
        type: Datatypes.TEXT,
      },
      createdAt: {
        allowNull: false,
        type: Datatypes.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Datatypes.DATE,
      },
    },
    {
      underscored: true,
    }
  );
};

module.exports = initTableModel;
