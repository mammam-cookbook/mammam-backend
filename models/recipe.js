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
                type: DataTypes.ARRAY(DataTypes.TEXT),
                allowNull: true,
            },
            status: {
                type: DataTypes.ENUM('Pending', 'Approved'),
                allowNull: false,
            },
            level: {
                type: DataTypes.ENUM('easy', 'medium', 'hard')
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
        },
        {
            tableName: "recipe",
            underscored: true,
        }
    );

    Recipe.associate = (models) => {
        Recipe.author = Recipe.belongsTo(models.User, {
          foreignKey: "user_id",
          as: "author"
        });
        Recipe.comments = Recipe.hasMany(models.Comment, {
            foreignKey: "recipe_id",
            as: "comments"
        });
        Recipe.challenges = Recipe.hasMany(models.Challenge, {
            foreignKey: "recipe_id",
            as: "challenges"
        })
        Recipe.reactions = Recipe.hasMany(models.Reaction, {
            foreignKey: "recipe_id",
            as: "reactions"

          });
        Recipe.rategories = Recipe.hasMany(models.CategoryRecipe, {
            foreignKey: "recipe_id",
            as: "categories"
        });
      };
    return Recipe;
};