'use strict';
module.exports = {
  up: async (queryInterface, DataTypes) => {
    await queryInterface.createTable('report', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
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
        problem : DataTypes.ARRAY(DataTypes.STRING),
        note: {
            type: DataTypes.STRING,
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
    await queryInterface.createTable('problem', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        key: {
            type: DataTypes.STRING,
        },
        description: {
            type: DataTypes.STRING,
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
    await queryInterface.dropTable('report');
    await queryInterface.dropTable('problem');
  }
};