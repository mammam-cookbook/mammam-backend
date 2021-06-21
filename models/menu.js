module.exports = (sequelize, DataTypes) => {
    const Menu = sequelize.define(
        "Menu",
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true
            },
            user_id: {
                type: DataTypes.UUID,
                allowNull: false,
                unique: 'menuConstraintIndex',
                references: {
                    model: 'user',
                    key: 'id'
                },
                onUpdate: 'cascade',
                onDelete: 'cascade'
            },
            recipe_id: {
                type: DataTypes.UUID,
                allowNull: false,
                unique: 'menuConstraintIndex',
                references: {
                    model: 'recipe',
                    key: 'id'
                },
                onUpdate: 'cascade',
                onDelete: 'cascade'
            },
            timestamp: {
                type: DataTypes.INTEGER,
                allowNull: false,
                unique: 'menuConstraintIndex',
            },
            session: {
                type: DataTypes.ENUM('morning', 'noon', 'night'),
                allowNull: false,
                unique: 'menuConstraintIndex',
            }
        },
        {
            tableName: "menu",
            underscored: true,
        }
    );

    Menu.associate = (models) => {
        Menu.user = Menu.belongsTo(models.User, {
            foreignKey: "user_id",
            as: "user"
          });
        Menu.recipe = Menu.belongsTo(models.Recipe, {
            foreignKey: "recipe_id",
            as: "recipe"
        });
      };

    return Menu;
};