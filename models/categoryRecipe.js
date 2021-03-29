module.exports = (sequelize, DataTypes) => {
    const CategoryRecipe = sequelize.define(
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

    CategoryRecipe.associate = (models) => {
        CategoryRecipe.recipe = CategoryRecipe.belongsTo(models.Recipe, {
          foreignKey: "recipe_id",
          as: "recipe"
        });
        CategoryRecipe.category = CategoryRecipe.belongsTo(models.Category, {
            foreignKey: "category_id",
            as: "category"
          });
      };

    return CategoryRecipe;
};