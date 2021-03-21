module.exports = (sequelize, DataTypes) => {
    const CatgegoryRecipe = sequelize.define(
        "CategoryRecipe",
        {
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
        },
        {
            tableName: "categoryRecipe",
            underscored: true,
        }
    );

    return CatgegoryRecipe;
};