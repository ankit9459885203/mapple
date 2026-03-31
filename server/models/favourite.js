module.exports = (sequelize, DataTypes) => {
  const Favorite = sequelize.define(
    "Favorite",
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
      tableName: "favorites",
      paranoid: true, // soft delete
      indexes: [
        {
          unique: true,
          fields: ["user_id", "product_id"], // one favorite per user per product
        },
      ],
    },
  );

  // Associations
  Favorite.associate = (models) => {
    // many to one             favorites  and  user
    Favorite.belongsTo(models.User, {
      foreignKey: "userId",
      as: "user",
    });

    // many to one               favourite and product
    Favorite.belongsTo(models.Product, {
      foreignKey: "productId",
      as: "product",
    });
  };

  return Favorite;
};
