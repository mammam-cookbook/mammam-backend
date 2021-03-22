module.exports = (sequelize, DataTypes) => {
    const CollectionItem = sequelize.define(
        "CollectionItem",
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true
            },
            collection_id: {
                type: DataTypes.UUID,
                allowNull: false,
                references: {
                    model: 'collection',
                    key: 'id'
                },
                onUpdate: 'cascade',
                onDelete: 'cascade'
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
        },
        {
            tableName: "collectionItem",
            underscored: true,
        }
    );
    
    CollectionItem.associate = (models) => {
        CollectionItem.recipe = CollectionItem.belongsTo(models.Recipe, {
            foreignKey: "recipe_id",
            as: "recipe"
        });
    };
    return CollectionItem;
};