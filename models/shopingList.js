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
        ShopingList.shopingItems= ShopingList.hasMany(models.ShopingItem, {
            foreignKey: "shoping_list_id",
            as: "shopingItems"
          });
      };

    return ShopingList;
};