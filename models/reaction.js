module.exports = (sequelize, DataTypes) => {
    const Reaction = sequelize.define(
        "Reaction",
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
            recipe_id: {
                type: DataTypes.UUID,
                references: {
                    model: 'recipe',
                    key: 'id'
                },
                onUpdate: 'cascade',
                onDelete: 'cascade',
                unique: 'unique_cmt'
            },
            react: {
                type: DataTypes.ENUM('yum', 'yuck', 'easy peasy', 'tough nut'),
                allowNull: false
            },
        },
        {
            tableName: "reaction",
            underscored: true,
        }
    );

    return Reaction;
};