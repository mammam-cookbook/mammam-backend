'use strict';
module.exports = {
  up: async (queryInterface, DataTypes) => {
    await queryInterface.createTable('upvote', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        user_id: {
            type: DataTypes.UUID,
            references: {
                model: 'user',
                key: 'id'
            },
            onUpdate: 'cascade',
            onDelete: 'cascade'
        },
        comment_id: {
            type: DataTypes.UUID,
            references: {
                model: 'comment',
                key: 'id'
            },
            onUpdate: 'cascade',
            onDelete: 'cascade'
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        updated_at: {
            type: DataTypes.DATE,
            allowNull: false,
        }
    })
  },
  down: async (queryInterface, DataTypes) => {
    await queryInterface.dropTable('upvote');
  }
};