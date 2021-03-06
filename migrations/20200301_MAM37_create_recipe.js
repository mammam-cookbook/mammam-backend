'use strict';
module.exports = {
  up: async (queryInterface, DataTypes) => {
    await queryInterface.createTable('recipe', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        title: {
          type: DataTypes.TEXT,
          allowNull: true
        },
        ration: DataTypes.INTEGER,
        description: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        cooking_time: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        avatar: {
            type: DataTypes.ARRAY(DataTypes.TEXT),
            allowNull: true,
        },
        status: {
            type: DataTypes.ENUM('Pending', 'Approved'),
            allowNull: false,
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
        steps: DataTypes.ARRAY(DataTypes.JSONB),
        ingredients : DataTypes.ARRAY(DataTypes.JSONB),
        ingredients_name : DataTypes.ARRAY(DataTypes.STRING),
        hashtags : DataTypes.ARRAY(DataTypes.STRING),
        categories: DataTypes.ARRAY(DataTypes.STRING),
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
    await queryInterface.dropTable('recipe');
  }
};