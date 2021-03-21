'use strict';
module.exports = {
  up: async (queryInterface, DataTypes) => {
    await queryInterface.createTable('collection', {
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
        name: {
            type: DataTypes.STRING,
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
    });
    await queryInterface.createTable('collectionItem', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        collection_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'collection',
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
    await queryInterface.dropTable('collection');
    await queryInterface.dropTable('collectionItem');
  }
};