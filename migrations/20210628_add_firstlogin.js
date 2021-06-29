'use strict';
module.exports = {
  up: async (queryInterface, DataTypes) => {
    await queryInterface.addColumn('user', 'first_login',
    {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: true
    })
  },
  down: async (queryInterface, DataTypes) => {
    await queryInterface.removeColumn('user', 'first_login');
  }
};