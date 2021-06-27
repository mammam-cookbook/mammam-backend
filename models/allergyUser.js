module.exports = (sequelize, DataTypes) => {
    const AllergyUser = sequelize.define(
        "AllergyUser",
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
            tableName: "allergyUser",
            underscored: true,
        }
    );

    AllergyUser.associate = (models) => {
        AllergyUser.user = AllergyUser.belongsTo(models.User, {
          foreignKey: "user_id",
          as: "user"
        });
        AllergyUser.category = AllergyUser.belongsTo(models.Category, {
          foreignKey: "category_id",
          as: "category"
        });
      };

    return AllergyUser;
}; 