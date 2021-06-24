module.exports = (sequelize, DataTypes) => {
    const CuisineUser = sequelize.define(
        "CuisineUser",
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
            user_id: {
                type: DataTypes.UUID,
                references: {
                    model: 'user',
                    key: 'id'
                },
                onUpdate: 'cascade',
                onDelete: 'cascade'
            },
        },
        {
            tableName: "cuisineUser",
            underscored: true,
        }
    );

    CuisineUser.associate = (models) => {
        CuisineUser.user = CuisineUser.belongsTo(models.User, {
          foreignKey: "user_id",
          as: "user"
        });
        CuisineUser.category = CuisineUser.belongsTo(models.Category, {
          foreignKey: "category_id",
          as: "category"
        });
      };

    return CuisineUser;
};