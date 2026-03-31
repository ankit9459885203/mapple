// note:-  go to users   there i have commented  things in brief , in rest model i only commneted new things which were not in users model

module.exports = (sequelize, DataTypes) => {
  const ChatMessage = sequelize.define(
    "ChatMessage",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      chatId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      senderType: {
        type: DataTypes.ENUM("USER", "ADMIN"),
        allowNull: false,
      },

      senderUserId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      senderAdminId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      imageUrl: {
  type: DataTypes.STRING,
  allowNull: true
},

      message: {
        type: DataTypes.TEXT,
        allowNull: false,
      },

      // this field is for chat message count
      isRead: {
  type: DataTypes.BOOLEAN,
  defaultValue: false // false measn message is new , when true then it means message is seen
},
    },
    {
      tableName: "chat_messages",
      paranoid: true,
    }
  );

  ChatMessage.associate = (models) => {
    ChatMessage.belongsTo(models.Chat, {
      foreignKey: "chatId",
      as: "chat",
    });

    ChatMessage.belongsTo(models.User, {
      foreignKey: "senderUserId",
      as: "userSender",
    });

    
  };

  return ChatMessage;
};
