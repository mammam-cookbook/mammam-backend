'use strict';
module.exports = {
    up: async (queryInterface, DataTypes) => {
        await queryInterface.addColumn('user', 'level',{
            type: DataTypes.ENUM('easy', 'medium', 'hard'),
        });
        //await queryInterface.addColumn('user', 'allergies',{
        //    type: DataTypes.ARRAY(DataTypes.STRING),
        //});
        await queryInterface.addColumn('user', 'disliked_ingredients',{
            type: DataTypes.ARRAY(DataTypes.STRING),
        });
        await queryInterface.createTable('allergyUser', {
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
            user_id: {
                type: DataTypes.UUID,
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
        });
        await queryInterface.createTable('dietUser', {
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
            user_id: {
                type: DataTypes.UUID,
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
        });
    },
    down: async (queryInterface, DataTypes) => {
        await queryInterface.removeColumn('level', 'user');
        //await queryInterface.removeColumn('allergies', 'user');
        await queryInterface.removeColumn('disliked_ingredients', 'user');
        await queryInterface.dropTable('allergyUser');
        await queryInterface.dropTable('dietUser');
    }
}; 