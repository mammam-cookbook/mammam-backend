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
            access_token: {
                type: DataTypes.TEXT,
                allowNull: true
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
            auth: {
                type: DataTypes.ENUM('Facebook', 'Google'),
                allowNull: true
            },
            device_token: {
                type: DataTypes.STRING,
                allowNull: true
            },
            level: {
                type: DataTypes.ENUM('easy', 'medium', 'hard')
            },
            //allergies : DataTypes.ARRAY(DataTypes.STRING),
            disliked_ingredients : DataTypes.ARRAY(DataTypes.STRING),
            first_login: {
                type: DataTypes.BOOLEAN,
                defaultValue: true,
                allowNull: true
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