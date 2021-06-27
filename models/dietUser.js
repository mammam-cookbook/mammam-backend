module.exports = (sequelize, DataTypes) => {
    const DietUser = sequelize.define(
        "DietUser",
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
            tableName: "dietUser",
            underscored: true,
        }
    );

    DietUser.associate = (models) => {
        DietUser.user = DietUser.belongsTo(models.User, {
          foreignKey: "user_id",
          as: "user"
        });
        DietUser.category = DietUser.belongsTo(models.Category, {
          foreignKey: "category_id",
          as: "category"
        });
      };

    return DietUser;
}; 