'use strict';
module.exports = {
  up: async (queryInterface, DataTypes) => {
    await queryInterface.createTable('follow', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        user_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'user',
                key: 'id'
            },
            onUpdate: 'cascade',
            onDelete: 'cascade'
        },
        following_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'user',
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
    }, {
        uniqueKeys: {
            actions_unique: {
                fields: ['user_id', 'following_id']
            }
        }
      });
  },
  down: async (queryInterface, DataTypes) => {
    await queryInterface.dropTable('follow');
    await queryInterface.removeConstraint('follow', 'follow_unique')
  }
};