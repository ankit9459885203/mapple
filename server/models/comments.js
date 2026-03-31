module.exports = (sequelize, DataTypes) => {
  const Comment = sequelize.define(
    "Comment",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },

      // FK → User
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      // FK → Product
      productId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      tableName: "comments",
      paranoid: true,
    },
  );

  //   Associations
  Comment.associate = (models) => {
    // many to one      comment and user
    Comment.belongsTo(models.User, {
      foreignKey: "userId",
      as: "user",
    });

    // many to one         comment and product
    Comment.belongsTo(models.Product, {
      foreignKey: "productId",
      as: "product",
    });
  };

  return Comment;
};
