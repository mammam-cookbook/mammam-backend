module.exports = {
    up: async (queryInterface, DataTypes) => {
      await queryInterface.addColumn('menu', 'timestamp',
      {
          type: DataTypes.INTEGER,
      })
    },
    down: async (queryInterface, DataTypes) => {
      await queryInterface.removeColumn('menu', 'timestamp');
    }
  };