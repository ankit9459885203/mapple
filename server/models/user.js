/* note :-  if you want any field feature common in all  models. then you can simply decalre it in config.json , see down i have added this "define" and fileds there-

"define": {  
      "timestamps": true,   // created_At ,delted_At ,updated_AT    all three will be created by it.
      "underscored": true   // sql prefers snake_case but js prefers camelCAse  .  hence all fields which are camel case in js models will be converted to snake case in sql table automatically.
    }
  },



  */
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User", // model or class  name  ,   baahr vaala toh normal file name hai
    // sequlize will use it for  - sequelize.models.User  , include, belongs to , association
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      full_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },

      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      phone_number: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      profile_image_url: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      role: {
        type: DataTypes.ENUM("USER", "ADMIN"),
        defaultValue: "USER",
      },

      is_email_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },

      deleted_at: {
        type: DataTypes.DATE,
      },

      reset_password_token: { // sent by mail to users phone 
        type: DataTypes.STRING,
      },

      reset_password_expires: {
        type: DataTypes.DATE,
      },
    },
    {
      tableName: "users", // used in database ,  because sql want plural table name. if you will not give it then mySql will autogenrate but sometimes autogenrated Pluralization can be wrong (Person → People)
      paranoid: true, // instead of permanent delete it enables soft delete using deleted_at
    },
  );

  User.associate = (models) => {
    //one : many     user - comments
    User.hasMany(models.Comment, {
      foreignKey: "userId",
      as: "comments", // relationship aleas , java hum postman pr data fetch krenge toh udr foreign key vale table kaa data bhi niklega , toh ye name udr aayega ki ye foreign key us table ki hai or uska data hai ye.
    });

    //one : many     user - comments
    User.hasMany(models.Review, {
      foreignKey: "userId",
      as: "reviews",
    });

    //one : many     user - likes

    User.hasMany(models.Like, {
      foreignKey: "userId",
      as: "likes",
    });

    //one : many     user - favourites
    User.hasMany(models.Favorite, {
      foreignKey: "userId",
      as: "favorites",
    });

    // one : many →      user - notifications
    User.hasMany(models.Notification, {
      foreignKey: "userId",
      as: "notifications",
    });

    // one: many       user- histroy
    User.hasMany(models.BrowsingHistory, {
      foreignKey: "userId",
      as: "browsingHistory",
    });

    // one : many        user starts many chats
    User.hasMany(models.Chat, {
      foreignKey: "userId",
      as: "chats",
    });

    // one : many          user sends many chat messages
    User.hasMany(models.ChatMessage, {
      foreignKey: "userId",
      as: "chatMessages",
    });
  };

  return User;
};
