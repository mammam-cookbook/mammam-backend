'use strict';
module.exports = {
  up: async (queryInterface, DataTypes) => {
    await queryInterface.createTable('notification', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        sender_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'user',
                key: 'id'
            },
            onUpdate: 'cascade',
            onDelete: 'cascade'
        },
        receiver_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'user',
                key: 'id'
            },
            onUpdate: 'cascade',
            onDelete: 'cascade'
        },
        read: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        type: {
            type: DataTypes.STRING,
            allowNull: false
        },
        recipe_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'recipe',
                key: 'id'
            },
            onUpdate: 'cascade',
            onDelete: 'cascade'
        },
        comment_id: {
            type: DataTypes.UUID,
            allowNull: false,
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
    });
  },
  down: async (queryInterface, DataTypes) => {
    await queryInterface.dropTable('notification');
  }
};