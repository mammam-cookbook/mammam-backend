module.exports = (sequelize, DataTypes) => {
    const Catgegory = sequelize.define(
        "Category",
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true
            },
            parent_category_id: {
                type: DataTypes.UUID,
                allowNull: false,
                references: {
                    model: 'category',
                    key: 'id'
                },
                onUpdate: 'cascade',
                onDelete: 'cascade'
            },
            vi: {
                type: DataTypes.STRING,
                allowNull: false
            },
            en: {
                type: DataTypes.STRING,
                allowNull: false
            },
        },
        {
            tableName: "category",
            underscored: true,
        }
    );

    return Catgegory;
};