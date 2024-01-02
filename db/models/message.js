"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Message extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.chat, {
        as: "chatroom",
        foreignKey: "chatroom_id",
      });
      this.belongsTo(models.user, {
        as: "from",
        foreignKey: "from_id",
      });
      this.belongsTo(models.user, {
        as: "to",
        foreignKey: "to_id",
      });
    }
  }
  Message.init(
    {
      chatroom_id: {
        type: DataTypes.INTEGER,
        references: {
          model: "chat",
          key: "id",
        },
      },
      content: { type: DataTypes.TEXT },
      from_id: {
        type: DataTypes.INTEGER,
        references: {
          model: "user",
          key: "id",
        },
      },
      to_id: {
        type: DataTypes.INTEGER,
        references: {
          model: "user",
          key: "id",
        },
      },
    },
    {
      sequelize,
      modelName: "message",
      underscored: true,
    }
  );
  return Message;
};
