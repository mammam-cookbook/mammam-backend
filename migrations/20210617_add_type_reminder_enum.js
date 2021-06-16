'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query("ALTER TYPE enum_notification_type ADD VALUE 'remind'");
  },

  down: (queryInterface, Sequelize) => {
    var query = 'DELETE FROM pg_enum ' +
      'WHERE enumlabel = \'remind\' ' +
      'AND enumtypid = ( SELECT oid FROM pg_type WHERE typname = \'enum_notification_type\')';
    return queryInterface.sequelize.query(query);
  }
};