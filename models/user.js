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
                type: DataTypes.ENUM('user', 'mod', 'admin'),
                allowNull: false,
                defaultValue: 'user'
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
            point: {
                type: DataTypes.INTEGER,
                allowNull: true,
                defaultValue: 0
            },
            rank: {
                type: DataTypes.ENUM('bronze', 'silver', 'gold', 'diamond'),
                allowNull: true,
                defaultValue: 'bronze'
            },
        },
        {
            tableName: "user",
            underscored: true,
        }
    );

    User.associate = (models) => {
        User.following = User.hasMany(models.Follow, {
          foreignKey: "user_id",
          as: "following"
        });
        User.follower = User.hasMany(models.Follow, {
            foreignKey: "following_id",
            as: "follower"
          });
      };

    return User;
};