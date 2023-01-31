const bookshelf = require('../bookshelf')

const Product = bookshelf.model('Product', {
    tableName:'products',
    category() { //one to one
        return this.belongsTo('Category')
    }
});

const Category = bookshelf.model('Category',{
    tableName: 'categories',
    products() { // one to many
        return this.hasMany('Product', 'category_id');
    }

})

module.exports = { Product, Category };