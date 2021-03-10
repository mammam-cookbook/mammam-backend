'use strict';
module.exports = {
  up: async (queryInterface, DataTypes) => {
    await queryInterface.createTable('comment', {
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
        status: {
            type: DataTypes.ENUM('Pending', 'Approved'),
            allowNull: false,
        },
        images: {
            type : DataTypes.ARRAY(DataTypes.TEXT)
        },
        content: {
            type: DataTypes.TEXT
        },
        parent_comment_id: {
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
    });
  },
  down: async (queryInterface, DataTypes) => {
    await queryInterface.dropTable('comment');
  }
};