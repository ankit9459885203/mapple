module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define(
    "Product",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },

      specification: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      price: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      colour: {
        type: DataTypes.STRING,
      },

      ratings: {
        type: DataTypes.INTEGER,
      },

      image: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      categoryId: {
        //FK
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },

    {
      tableName: "products",
      paranoid: true,  },
  );

  Product.associate = (models) => {
    //   many  :  one            MANY PRODUCTS → ONE CATEGORY
    Product.belongsTo(models.Category, {
      foreignKey: "categoryId",
      as: "category",
    });

    // one : many          product  & comments
    Product.hasMany(models.Comment, {
      foreignKey: "productId",
      as: "comments",
    });

    // one : many          product  & comments
    Product.hasMany(models.Review, {
      foreignKey: "productId",
      as: "reviews",
    });

    // one : many          product  & users
    Product.hasMany(models.Like, {
      foreignKey: "productId",
      as: "likes",
    });

    // one : many          product  & favourite

    Product.hasMany(models.Favorite, {
      foreignKey: "productId",
      as: "favorites",
    });

    // one : many          product & browsing history
    Product.hasMany(models.BrowsingHistory, {
      foreignKey: "productId",
      as: "browsingHistory",
    });
  };

  return Product;
};
