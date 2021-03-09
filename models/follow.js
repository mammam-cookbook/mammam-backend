module.exports = (sequelize, DataTypes) => {
    const Follow = sequelize.define(
        "Follow",
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
            following_id: {
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
            tableName: "follow",
            underscored: true,
        }
    );

    Follow.associate = (models) => {
        Follow.user = Follow.belongsTo(models.User, {
          foreignKey: "user_id",
          as: "user"
        });
        Follow.following = Follow.belongsTo(models.User, {
            foreignKey: "following_id",
            as: "following"
          });
      };

    return Follow;
};