'use strict';
module.exports = {
  up: async (queryInterface, DataTypes) => {
    await queryInterface.addColumn('menu', 'session',
    {
        type: DataTypes.ENUM('morning', 'noon', 'night'),
        allowNull: false,
    })
  },
  down: async (queryInterface, DataTypes) => {
    await queryInterface.removeColumn('menu', 'session');
  }
};