"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Chat extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.user, {
        as: "user1",
        foreignKey: "user1_id",
      });
      this.belongsTo(models.user, {
        as: "user2",
        foreignKey: "user2_id",
      });
      this.hasMany(models.message, {
        as: "chatroom",
        foreignKey: "chatroom_id",
      });
      this.hasMany(models.meetup, {
        as: "meetup",
        foreignKey: "chat_id",
      });
    }
  }
  Chat.init(
    {
      title: { type: DataTypes.STRING, allowNull: false },
      user1_id: {
        type: DataTypes.INTEGER,
        references: {
          model: "user",
          key: "id",
        },
      },
      user2_id: {
        type: DataTypes.INTEGER,
        references: {
          model: "user",
          key: "id",
        },
      },
    },
    {
      sequelize,
      modelName: "chat",
      underscored: true,
    }
  );
  return Chat;
};
