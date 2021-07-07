module.exports = {
    up: (queryInterface, Sequelize) => {
        return Promise.all([
            queryInterface.changeColumn('user', 'avatar_url', {
                type: Sequelize.TEXT,
                allowNull: true,
            })
        ])
    },

    down: (queryInterface, Sequelize) => {
        return Promise.all([
            queryInterface.changeColumn('user ', 'avatar_url', {
                type: Sequelize.STRING,
                allowNull: true,
            })
        ])
    }
};