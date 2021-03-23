module.exports = (sequelize, DataTypes) => {
    const Collection = sequelize.define(
        "Collection",
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
            name: {
                type: DataTypes.STRING,
                allowNull: false
            },
        },
        {
            tableName: "collection",
            underscored: true,
        }
    );

    Collection.associate = (models) => {
        Collection.user = Collection.belongsTo(models.User, {
            foreignKey: "user_id",
            as: "user"
        });
        Collection.recipes = Collection.hasMany(models.CollectionItem, {
            foreignKey: "collection_id",
            as: "recipes"
        });
    };

    return Collection;
};