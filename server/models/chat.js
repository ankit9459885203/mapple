// note:-  go to users   there i have commented  things in brief , in rest model i only commneted new things which were not in users model



module.exports = (sequelize, DataTypes) => {
  const Chat = sequelize.define(
    "Chat",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true 
      },

      status: {
        type: DataTypes.ENUM("OPEN", "CLOSED"),
        defaultValue: "OPEN",
      },

      
    },
    {
      tableName: "chats",
      paranoid: true,
    }
  );

  Chat.associate = (models) => {
    Chat.belongsTo(models.User, {
      foreignKey: "userId",
      as: "user",
    });

    Chat.hasMany(models.ChatMessage, {
      foreignKey: "chatId",
      as: "messages",
    });
  };

  return Chat;
};
