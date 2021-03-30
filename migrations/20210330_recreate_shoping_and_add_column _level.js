'use strict';
module.exports = {
  up: async (queryInterface, DataTypes) => {
    await queryInterface.dropTable('shopingItem');
    await queryInterface.addColumn('shopingList', 'recipe_id',{
        type: DataTypes.UUID,
        references: {
            model: 'recipe',
            key: 'id'
        },
        onUpdate: 'cascade',
        onDelete: 'cascade'
    })
    await queryInterface.addColumn('recipe', 'level',{
        type: DataTypes.ENUM('easy', 'medium', 'hard'),
    })
  },
  down: async (queryInterface, DataTypes) => {
    await queryInterface.createTable('shopingItem', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        shoping_list_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'shopingList',
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
    await queryInterface.removeColumn('recipe_id', 'shopingList')
    await queryInterface.removeColumn('level', 'recipe')
}
};