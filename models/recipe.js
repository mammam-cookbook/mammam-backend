module.exports = (sequelize, DataTypes) => {
    const Recipe = sequelize.define(
        "Recipe",
        {
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
                type: DataTypes.TEXT,
                allowNull: true,
            },
            status: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 1
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
            ingredients : DataTypes.ARRAY(DataTypes.STRING),
            hashtags : DataTypes.ARRAY(DataTypes.STRING),
            categories: DataTypes.ARRAY(DataTypes.STRING),
            steps: DataTypes.ARRAY(DataTypes.JSONB),
        },
        {
            tableName: "recipe",
            underscored: true,
        }
    );
    return Recipe;
};