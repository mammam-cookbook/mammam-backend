module.exports = (sequelize, DataTypes) => {
    const Upvote = sequelize.define(
        "Upvote",
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true
            },
            user_id: {
                type: DataTypes.UUID,
                references: {
                    model: 'user',
                    key: 'id'
                },
                onUpdate: 'cascade',
                onDelete: 'cascade',
                unique: 'unique_cmt'
            },
            comment_id: {
                type: DataTypes.UUID,
                references: {
                    model: 'comment',
                    key: 'id'
                },
                onUpdate: 'cascade',
                onDelete: 'cascade',
                unique: 'unique_cmt'
            },
        },
        {
            tableName: "upvote",
            underscored: true,
        }
    );

    Upvote.associate = (models) => {
        Upvote.author = Upvote.belongsTo(models.User, {
            foreignKey: "user_id",
            as: "author"
        });
        Upvote.comment = Upvote.belongsTo(models.Comment, {  
            foreignKey: "comment_id",
            as: "comment"
        });
    };

    return Upvote;
};