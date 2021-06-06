module.exports = (sequelize, DataTypes) => {
    const Report = sequelize.define(
        "Report",
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true
            },
            problem: {
                type: DataTypes.ARRAY(DataTypes.STRING),
            },
            note: {
                type: DataTypes.STRING,
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
            tableName: "report",
            underscored: true,
        }
    );

    Report.associate = (models) => {
        Report.recipe = Report.belongsTo(models.Recipe, {
            foreignKey: "recipe_id",
            as: "recipe"
        });
    };
    return Report;
};