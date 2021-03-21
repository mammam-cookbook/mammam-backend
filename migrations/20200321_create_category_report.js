'use strict';
module.exports = {
  up: async (queryInterface, DataTypes) => {
    await queryInterface.removeColumn('recipe', 'categories');
    await queryInterface.createTable('category', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        parent_category_id: {
            type: DataTypes.UUID,
            references: {
                model: 'category',
                key: 'id'
            },
            onUpdate: 'cascade',
            onDelete: 'cascade'
        },
        vi: {
            type: DataTypes.STRING,
            allowNull: false
        },
        en: {
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
    })
    await queryInterface.createTable('categoryRecipe', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        category_id: {
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
        created_at: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        updated_at: {
            type: DataTypes.DATE,
            allowNull: false,
        }
    })
    await queryInterface.createTable('report', {
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
        recipe_id: {
            type: DataTypes.UUID,
            references: {
                model: 'recipe',
                key: 'id'
            },
            onUpdate: 'cascade',
            onDelete: 'cascade'
        },
        content: {
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
    })
  },
  down: async (queryInterface, DataTypes) => {
    await queryInterface.addColumn('recipe', 'categories', DataTypes.ARRAY(DataTypes.STRING));
    await queryInterface.dropTable('category');

  }
};