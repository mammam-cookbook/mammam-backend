module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define(
        "User",
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true
            },
            name: {
              type: DataTypes.STRING,
              allowNull: true
            },
            email: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            password: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            role: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 1
            },
            avatar_url: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            status: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 1
            },
            ref_token: {
                type: DataTypes.STRING,
                defaultValue: DataTypes.UUIDV4,
                allowNull: false,
            },
            reset_password_token: {
                type: DataTypes.STRING,
                allowNull: true
            },
            expire_token: {
                type: DataTypes.DATE,
                allowNull: true
            },
        },
        {
            tableName: "user",
            underscored: true,
        }
    );
    return User;
};