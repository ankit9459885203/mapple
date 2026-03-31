// note:-  go to users   there i have commented  things in brief , in rest model i only commneted new things which were not in users model

module.exports = (sequelize, DataTypes) => {
  const BrowsingHistory = sequelize.define(
    "BrowsingHistory",
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

      // last time user viewed this product
      viewedAt: {  // time stamp humne on rkhaa hia but vo created ,deleted,updated kaa hi feature dete , not for viewedAt time.
        type: DataTypes.DATE, 
        allowNull: false,
        defaultValue: DataTypes.NOW, //  default  value will be viewedAt: new Date()
      },
    },
    {
      tableName: "browsing_history",
      indexes: [
        //  it is a  constraint which tells that   One user can have only ONE record for one product in this table.
        {
          unique: true,
          fields: ["user_id", "product_id"], // one entry per product per user
        },
      ],
    },
  );

  // Associations
  BrowsingHistory.associate = (models) => {
    BrowsingHistory.belongsTo(models.User, {
      foreignKey: "userId",
      as: "user",
    });

    BrowsingHistory.belongsTo(models.Product, {
      foreignKey: "productId",
      as: "product",
    });
  };

  return BrowsingHistory;
};
