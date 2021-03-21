'use strict';
module.exports = {
  up: async (queryInterface, DataTypes) => {
    await queryInterface.createTable('reaction', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        user_id: {
            type: DataTypes.UUID,
            references: {
                model: 'category',
                key: 'id'
            },
            onUpdate: 'cascade',
            onDelete: 'cascade'
        },
        recipe_id: {
            type: DataTypes.UUID,
            references: {
                model: 'recipe',
                key: 'id'
            },
            onUpdate: 'cascade',
            onDelete: 'cascade'
        },
        react: {
            type: DataTypes.ENUM('yum', 'yuck', 'easy peasy', 'tough nut'),
            allowNull: false
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
    await queryInterface.createTable('recipeViews', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        recipe_id: {
            type: DataTypes.UUID,
            references: {
                model: 'recipe',
                key: 'id'
            },
            onUpdate: 'cascade',
            onDelete: 'cascade'
        },
        count: {
            type: DataTypes.INTEGER,
            allowNull: false
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
    await queryInterface.dropTable('recipeViews');
    await queryInterface.dropTable('reaction');
  }
};