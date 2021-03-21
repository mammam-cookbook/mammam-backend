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
                    model: 'category',
                    key: 'id'
                },
                onUpdate: 'cascade',
                onDelete: 'cascade'
            },
            recipe_id: {
                type: DataTypes.UUID,
                references: {
                    model: 'recipe',
                    key: 'id'
                },
                onUpdate: 'cascade',
                onDelete: 'cascade'
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