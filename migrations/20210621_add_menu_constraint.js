module.exports = {
    up: async (queryInterface, DataTypes) => {
        await queryInterface.addConstraint('menu', {
            fields:  ['user_id', 'recipe_id', 'timestamp', 'session'],
            type: 'unique',
            name: 'menuConstraintIndex'
          });
    },
    down: async (queryInterface, DataTypes) => {
        await queryInterface.removeConstraint('menu', 'menuConstraintIndex')
    }
  };