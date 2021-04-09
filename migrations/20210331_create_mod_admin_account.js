'use strict';
require("dotenv").config();
const bcrypt = require('bcryptjs')
const accounts = [
    {
        id: "98f3bb11-f711-46f3-baec-7a856a00a93a",
        email: "admin@admin.com",
        role: "admin",
        name: "admin",
        status: 1,
        ref_token: "ref_token_admin",
        password: bcrypt.hashSync("admin", process.env.SALT || 10),
        created_at: new Date(),
        updated_at: new Date()
    },
    {
        id: "98f3bb11-f711-46f3-baec-7a856a00a93b",
        email: "mod1@mod.com",
        role: "mod",
        name: "mod 1",
        status: 1,
        ref_token: "ref_token_admin",
        password: bcrypt.hashSync("mod", process.env.SALT || 10),
        created_at: new Date(),
        updated_at: new Date()
    },
    {
        id: "98f3bb11-f711-46f3-baec-7a856a00a93e",
        email: "mod2@mod.com",
        role: "mod",
        status: 1,
        name: "mod 2",
        ref_token: "ref_token_admin",
        password: bcrypt.hashSync("mod", process.env.SALT || 10),
        created_at: new Date(),
        updated_at: new Date()

    },
    {
        id: "98f3bb11-f711-46f3-baec-7a856a00a93d",
        email: "mod3@mod.com",
        role: "mod",
        status: 1,
        name: "mod 3",        
        ref_token: "ref_token_admin",
        password: bcrypt.hashSync("mod", process.env.SALT || 10),
        created_at: new Date(),
        updated_at: new Date()
    }
]
module.exports = {
    up: async (queryInterface, DataTypes) => {
        await queryInterface.bulkInsert('user',
            accounts)
    },
    down: async (queryInterface, DataTypes) => {
    }
};