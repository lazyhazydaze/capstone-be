"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class FriendRequest extends Model {
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
  FriendRequest.init(
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
    },
    {
      sequelize,
      modelName: "friendrequest",
      underscored: true,
    }
  );
  return FriendRequest;
};
