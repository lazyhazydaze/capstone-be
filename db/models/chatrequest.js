"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class ChatRequest extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.user, { as: "sender", foreignKey: "sender_id" });
      this.belongsTo(models.user, {
        as: "recipient",
        foreignKey: "recipient_id",
      });
    }
  }
  ChatRequest.init(
    {
      sender_id: {
        type: DataTypes.INTEGER,
        references: {
          model: "user",
          key: "id",
        },
      },
      recipient_id: {
        type: DataTypes.INTEGER,
        references: {
          model: "user",
          key: "id",
        },
      },
      is_rejected: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "chatrequest",
      underscored: true,
    }
  );
  return ChatRequest;
};
