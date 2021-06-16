'use strict';
module.exports = {
  up: async (queryInterface, DataTypes) => {
    await queryInterface.addColumn('user', 'device_token',
    {
        type: DataTypes.STRING,
        allowNull: true,
    })
  },
  down: async (queryInterface, DataTypes) => {
    await queryInterface.removeColumn('user', 'device_token');
  }
};