module.exports = (sequelize, DataTypes) => {
    const Comment = sequelize.define(
        "Comment",
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
            parent_comment_id: {
                type: DataTypes.UUID,
                references: {
                    model: 'comment',
                    key: 'id'
                },
                onUpdate: 'cascade',
                onDelete: 'cascade'
            },
        },
        {
            tableName: "comment",
            underscored: true,
        }
    );

    Comment.associate = (models) => {
        Comment.author = Comment.belongsTo(models.User, {
            foreignKey: "user_id",
            as: "author"
        });
        Comment.parentComment = Comment.belongsTo(models.Comment, {
            foreignKey: "parent_comment_id",
            as: "parentComment"
        });
        Comment.recipe = Comment.belongsTo(models.Recipe, {
            foreignKey: "recipe_id",
            as: "recipe"
        });
    };
    return Comment;
};