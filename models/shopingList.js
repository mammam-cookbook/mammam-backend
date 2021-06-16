module.exports = (sequelize, DataTypes) => {
    const ShopingList = sequelize.define(
        "ShopingList",
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
            ration: DataTypes.INTEGER
        },
        {
            tableName: "shopingList",
            underscored: true,
        }
    );

    ShopingList.associate = (models) => {
        ShopingList.user = ShopingList.belongsTo(models.User, {
          foreignKey: "user_id",
          as: "user"
        });
        ShopingList.recipe = ShopingList.belongsTo(models.Recipe, {
            foreignKey: "recipe_id",
            as: "recipe"
          });
      };

    return ShopingList;
};