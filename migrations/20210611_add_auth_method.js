'use strict';
module.exports = {
  up: async (queryInterface, DataTypes) => {
    await queryInterface.addColumn('user', 'auth',
    {
        type: DataTypes.ENUM('Facebook', 'Google'),
    })
  },
  down: async (queryInterface, DataTypes) => {
    await queryInterface.removeColumn('user', 'auth');
  }
};