module.exports = (sequelize, DataTypes) => {
    const ShopingItem = sequelize.define(
        "ShopingItem",
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true
            },
            shoping_list_id: {
                type: DataTypes.UUID,
                allowNull: false,
                references: {
                    model: 'shopingList',
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
        },
        {
            tableName: "shopingItem",
            underscored: true,
        }
    );

    ShopingItem.associate = (models) => {
        ShopingItem.shopingList = ShopingItem.belongsTo(models.ShopingList, {
          foreignKey: "shoping_list_id",
          as: "shopingList"
        });
      };

    return ShopingItem;
};