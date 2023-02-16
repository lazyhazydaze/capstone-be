'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "interests",
      [
        {
          name: "Basketball",
        },
        {
          name: "Leetcode",
        },
        {
          name: "Chess",
        },
        {
          name: "Table Tennis",
        },
        {
          name: "Golf",
        },
      ],
      {}
    );
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete("interests", null, {});
  }
};
