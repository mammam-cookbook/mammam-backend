module.exports = (sequelize, DataTypes) => {
    const RecipeViews = sequelize.define(
        "RecipeViews",
        {
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
        },
        {
            tableName: "recipeViews",
            underscored: true,
        }
    );

    return RecipeViews;
};