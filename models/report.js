module.exports = (sequelize, DataTypes) => {
    const Report = sequelize.define(
        "Report",
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true
            },
            note: {
                type: DataTypes.STRING,
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
        Report.author = Report.belongsTo(models.User, {
            foreignKey: "user_id",
            as: "author"
        });
        Report.reportProblem = Report.hasMany(models.ReportProblem, {
            foreignKey: "report_id",
            as: "reportProblem"
        })
    };
    return Report;
};