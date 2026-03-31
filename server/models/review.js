module.exports = (sequelize, DataTypes) => {
  const Review = sequelize.define(
    "Review",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      rating: {
        type: DataTypes.DECIMAL(2, 1), //DECIMAL(totalDigits, decimalPlaces)  mtlv ki point k baad kitna number aana, here we said 1 , eg- 3.1  , 4.1 etc.
        allowNull: false,
        validate: {
          min: 1,
          max: 5,
        },
      },

      // optional text review
      reviewText: {
        type: DataTypes.TEXT,
        allowNull: true,
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
      tableName: "reviews",
      paranoid: true, // soft delete
      indexes: [
        {
          unique: true, // Unique Constraint , ensures One user can review a product only once
          fields: ["user_id", "product_id"], // one review per user per product
        },
      ],
    },
  );

  // Associations
  Review.associate = (models) => {
    //   many to one         reviews and user
    Review.belongsTo(models.User, {
      foreignKey: "userId",
      as: "user",
    });

    // many to one       reviews   and product
    Review.belongsTo(models.Product, {
      foreignKey: "productId",
      as: "product",
    });
  };

  return Review;
};
