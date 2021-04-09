
import { uid, suid } from 'rand-token';
const account = [
    {
        email: `unit_test_account${uid(12)}@gmail.com`,
        password: "12345678"
    },
    {
        email: `unit_test_account${uid(12)}@gmail.com`,
        password: "12345678"
    },
    {
        email: `unit_test_account${uid(12)}@gmail.com`,
        password: "12345678"
    },
]

module.exports = account;