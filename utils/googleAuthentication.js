const { auth } = require('@googleapis/analytics')
require("dotenv").config();
const scopes = 'https://www.googleapis.com/auth/analytics.readonly'
exports.jwt = new auth.JWT(process.env.CLIENT_EMAIL, null, process.env.PRIVATE_KEY, scopes)
