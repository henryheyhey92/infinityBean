const bookshelf = require('../bookshelf')

const Product = bookshelf.model('Product', {
    tableName:'products',
    category() { //one to one
        return this.belongsTo('Category')
    },
    tags() { // many to many
        return this.belongsToMany('Tag');
    }
});

const Category = bookshelf.model('Category',{
    tableName: 'categories',
    products() { // one to many
        return this.hasMany('Product', 'category_id');
    }

})

const Tag = bookshelf.model('Tag',{
    tableName: 'tags',
    products() {
        return this.belongsToMany('Product')
    }
})

const User = bookshelf.model('User',{
    tableName: 'users'
})

const CartItem = bookshelf.model('CartItem', {
    tableName: 'cart_items',
    product() {
        return this.belongsTo('Product')
    }

})

const BlacklistedToken = bookshelf.model('BlacklistedToken',{
    tableName: 'blacklisted_tokens'
})


module.exports = { Product, Category, Tag, User, CartItem , BlacklistedToken};