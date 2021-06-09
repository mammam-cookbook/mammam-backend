module.exports = (sequelize, DataTypes) => {
    const Problem = sequelize.define(
        "Problem",
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true
            },
            key: {
                type: DataTypes.STRING,
            },
            description: {
                type: DataTypes.STRING,
            },
        },
        {
            tableName: "problem",
            underscored: true,
        }
    );

    return Problem;
};