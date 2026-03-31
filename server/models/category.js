// note:-  go to users   there i have commented  things in brief , in rest model i only commneted new things which were not in users model

module.exports = (sequelize, DataTypes) => {
  const Category = sequelize.define(
    "Category",
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

      image: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      tableName: "categories",
      paranoid: true, // paranoid is true so if we delete the item then it will not be deleted permanantyly ,it will be delete for user but still present somewhere so we can recover
    },
  );

  Category.associate = (models) => {
    // one: many       category and product
    Category.hasMany(models.Product, {
      foreignKey: "categoryId",
      as: "products",
    });
  };

  return Category;
};
