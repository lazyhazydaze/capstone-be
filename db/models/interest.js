"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Interest extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsToMany(models.user, {
        through: "user_interests",
      });
    }
  }
  Interest.init(
    {
      name: { type: DataTypes.STRING, allowNull: false },
    },
    {
      sequelize,
      modelName: "interest",
      underscored: true,
    }
  );
  return Interest;
};