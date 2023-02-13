"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("users", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      username: {
        type: Sequelize.STRING,
        unique: true,
      },
      password: {
        type: Sequelize.STRING,
      },
      email: {
        type: Sequelize.STRING,
        unique: true,
      },
      firstname: {
        type: Sequelize.STRING,
      },
      profilepic: {
        type: Sequelize.STRING(1000000),
      },
      location: {
        type: Sequelize.STRING,
      },
      gender: {
        type: Sequelize.STRING,
      },
      yearofbirth: {
        type: Sequelize.INTEGER,
      },
      biography: {
        type: Sequelize.TEXT,
      },
      online: {
        type: Sequelize.BOOLEAN,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("users");
  },
};
