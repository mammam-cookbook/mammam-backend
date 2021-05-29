'use strict';
module.exports = {
  up: async (queryInterface, DataTypes) => {
    await queryInterface.addColumn('user', 'point',
    {
        type: DataTypes.INTEGER,
        allowNull: true,
    })
  },
  down: async (queryInterface, DataTypes) => {
    await queryInterface.removeColumn('user', 'point');
  }
};