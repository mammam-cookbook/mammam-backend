module.exports = (sequelize, DataTypes) => {
    const Notification = sequelize.define(
        "Notification",
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true
            },
            sender_id: {
                type: DataTypes.UUID,
                allowNull: false,
                references: {
                    model: 'user',
                    key: 'id'
                },
                onUpdate: 'cascade',
                onDelete: 'cascade'
            },
            receiver_id: {
                type: DataTypes.UUID,
                allowNull: false,
                references: {
                    model: 'user',
                    key: 'id'
                },
                onUpdate: 'cascade',
                onDelete: 'cascade'
            },
            read: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false
            },
            type: {
                type: DataTypes.ENUM('comment', 'like', 'follow', 'reply'),
                allowNull: false
            },
            recipe_id: {
                type: DataTypes.UUID,
                allowNull: true,
                references: {
                    model: 'recipe',
                    key: 'id'
                },
                onUpdate: 'cascade',
                onDelete: 'cascade'
            },
            comment_id: {
                type: DataTypes.UUID,
                allowNull: true,
                references: {
                    model: 'comment',
                    key: 'id'
                },
                onUpdate: 'cascade',
                onDelete: 'cascade'
            },
        },
        {
            tableName: "notification",
            underscored: true,
        }
    );

    Notification.associate = (models) => {
        Notification.recipe = Notification.belongsTo(models.Recipe, {
            foreignKey: "recipe_id",
            as: "recipe"
          });
        Notification.comment = Notification.belongsTo(models.Comment, {
            foreignKey: "comment_id",
            as: "comment"
        });
        Notification.sender = Notification.belongsTo(models.User, {
            foreignKey: "sender_id",
            as: "sender"
        });
        Notification.receiver = Notification.belongsTo(models.User, {
            foreignKey: "receiver_id",
            as: "receiver"
        });
      };

    return Notification;
};