'use strict';
module.exports = {
  up: async (queryInterface, DataTypes) => {
    await queryInterface.addColumn('user', 'rank',
    {
        type: DataTypes.ENUM('bronze', 'silver', 'gold', 'diamond'),
        allowNull: true,
    })
  },
  down: async (queryInterface, DataTypes) => {
    await queryInterface.removeColumn('user', 'rank');
  }
};