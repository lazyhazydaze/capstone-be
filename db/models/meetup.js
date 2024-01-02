"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Meetup extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.chat, {
        as: "chat",
        foreignKey: "chat_id",
      });
      this.belongsTo(models.user, {
        as: "author",
        foreignKey: "author_id",
      });
    }
  }
  Meetup.init(
    {
      chat_id: {
        type: DataTypes.INTEGER,
        references: {
          model: "chat",
          key: "id",
        },
      },
      author_id: {
        type: DataTypes.INTEGER,
        references: {
          model: "user",
          key: "id",
        },
      },
      title: { type: DataTypes.STRING },
      tag: { type: DataTypes.STRING },
      datetime: { type: DataTypes.DATE },
      location: { type: DataTypes.STRING },
      comment: { type: DataTypes.TEXT },
      pending: { type: DataTypes.BOOLEAN },
      accepted: { type: DataTypes.BOOLEAN },
      rejected: { type: DataTypes.BOOLEAN },
    },
    {
      sequelize,
      modelName: "meetup",
      underscored: true,
    }
  );
  return Meetup;
};
