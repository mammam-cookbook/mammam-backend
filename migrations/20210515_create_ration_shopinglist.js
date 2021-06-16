'use strict';
module.exports = {
  up: async (queryInterface, DataTypes) => {
    await queryInterface.addColumn('shopingList', 'ration',
    {
        type: DataTypes.INTEGER,
        allowNull: true,
    })
  },
  down: async (queryInterface, DataTypes) => {
    await queryInterface.removeColumn('shopingList', 'ration');
  }
};