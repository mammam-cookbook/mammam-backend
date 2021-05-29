module.exports = (sequelize, DataTypes) => {
    const Challenge = sequelize.define(
        "Challenge",
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true
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
            status: {
                type: DataTypes.ENUM('Pending', 'Approved'),
                allowNull: false,
            },
            images: {
                type: DataTypes.ARRAY(DataTypes.TEXT)
            },
            content: {
                type: DataTypes.TEXT
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
        },
        {
            tableName: "challenge",
            underscored: true,
        }
    );

    Challenge.associate = (models) => {
        Challenge.author = Challenge.belongsTo(models.User, {
            foreignKey: "user_id",
            as: "author"
        });
        Challenge.recipe = Challenge.belongsTo(models.Recipe, {
            foreignKey: "recipe_id",
            as: "recipe"
        });
    };
    return Challenge;
};