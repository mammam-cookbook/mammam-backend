module.exports = (sequelize, DataTypes) => {
    const ReportProblem = sequelize.define(
        "ReportProblem",
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true
            },
            report_id: {
                type: DataTypes.UUID,
                allowNull: false,
                references: {
                    model: 'report',
                    key: 'id'
                },
                onUpdate: 'cascade',
                onDelete: 'cascade'
            },
            problem_id: {
                type: DataTypes.UUID,
                allowNull: false,
                references: {
                    model: 'problem',
                    key: 'id'
                },
                onUpdate: 'cascade',
                onDelete: 'cascade'
            }
        },
        {
            tableName: "reportProblem",
            underscored: true,
        }
    );

    ReportProblem.associate = (models) => {
        ReportProblem.problem = ReportProblem.belongsTo(models.Problem, {
            foreignKey: "problem_id",
            as: "problem"
        });
    };
      
    return ReportProblem;
};