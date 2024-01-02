"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class UserInterest extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.user, {
        foreignKey: "user_id",
      });
      this.belongsTo(models.interest, {
        foreignKey: "interest_id",
      });
    }
  }
  UserInterest.init(
    {
      user_id: {
        type: DataTypes.INTEGER,
        references: {
          model: "user",
          key: "id",
        },
      },
      interest_id: {
        type: DataTypes.INTEGER,
        references: {
          model: "interest",
          key: "id",
        },
      },
    },
    {
      sequelize,
      modelName: "userinterest",
      underscored: true,
    }
  );
  return UserInterest;
};
