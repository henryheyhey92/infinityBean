// Setting up the database connection
const knex = require('knex')({
    client: 'mysql',
    connection: {
        user: 'henrysecAdmin',
        password: 'coffeeBean@8910',
        database: 'organic'
    }
})
const bookshelf = require('bookshelf')(knex)

module.exports = bookshelf;