module.exports = {
    up: async (queryInterface, DataTypes) => {
      await queryInterface.removeColumn('menu', 'date');
    },
    down: async (queryInterface, DataTypes) => {
        await queryInterface.addColumn('menu', 'date',
        {
            type: DataTypes.DATE,
        })
    }
  };