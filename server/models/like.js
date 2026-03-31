module.exports = (sequelize, DataTypes) => {
  const Like = sequelize.define(
    "Like",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
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
      tableName: "likes",
      paranoid: true, // soft delete support
      indexes: [
        {
          unique: true,
          fields: ["user_id", "product_id"], // one like per user per product
        },
      ],
    },
  );

  // Associations
  Like.associate = (models) => {
    // many likes → one user
    Like.belongsTo(models.User, {
      foreignKey: "userId",
      as: "user",
    });

    // many likes → one product
    Like.belongsTo(models.Product, {
      foreignKey: "productId",
      as: "product",
    });
  };

  return Like;
};
