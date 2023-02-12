"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsToMany(models.interest, {
        through: "user_interests",
      });
      this.hasMany(models.chatrequest, {
        as: "sender",
        foreignKey: "sender_id",
      });
      this.hasMany(models.chatrequest, {
        as: "recipient",
        foreignKey: "recipient_id",
      });
      this.hasMany(models.chat, {
        as: "user1",
        foreignKey: "user1_id",
      });
      this.hasMany(models.chat, {
        as: "user2",
        foreignKey: "user2_id",
      });
      this.hasMany(models.message, {
        as: "from",
        foreignKey: "from_id",
      });
      this.hasMany(models.message, {
        as: "to",
        foreignKey: "to_id",
      });
      this.hasMany(models.meetup, {
        as: "author",
        foreignKey: "author_id",
      });
    }
  }
  User.init(
    {
      username: { type: DataTypes.STRING, allowNull: false, unique: true },
      password: { type: DataTypes.STRING, allowNull: false },
      email: { type: DataTypes.STRING, allowNull: false, unique: true },
      firstname: { type: DataTypes.STRING, allowNull: false },
      profilepic: { type: DataTypes.STRING },
      location: { type: DataTypes.STRING, allowNull: false },
      gender: { type: DataTypes.STRING, allowNull: false },
      yearofbirth: { type: DataTypes.INTEGER, allowNull: false },
      biography: { type: DataTypes.TEXT },
      online: { type: DataTypes.BOOLEAN, allowNull: false },
    },
    {
      sequelize,
      modelName: "user",
      underscored: true,
    }
  );
  return User;
};
