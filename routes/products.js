const express = require("express");
const router = express.Router();

// #1 import in the Product model
const { Product, Category, Tag } = require('../models');
// import in the CheckIfAuthenticated middleware
const { checkIfAuthenticated } = require('../middlewares');

// import in the Forms
const { bootstrapField, createProductForm } = require('../forms');

router.get('/', async (req, res) => {
    // #2 - fetch all the products (ie, SELECT * from products)
    let products = await Product.collection().fetch({
        withRelated: ['category', 'tags']
    });
    console.log(products.toJSON());
    res.render('products/index', {
        'products': products.toJSON() // #3 - convert collection to JSON
    })
})

router.get('/create', checkIfAuthenticated, async (req, res) => {
    // retrieve one to many
    const allCategories = await Category.fetchAll().map((category) => {
        return [category.get('id'), category.get('name')];
    })
    // retrieve all the tags, many to many
    const allTags = await Tag.fetchAll().map(tag => [tag.get('id'), tag.get('name')]);
    const productForm = createProductForm(allCategories, allTags);
    
    res.render('products/create', {
        'form': productForm.toHTML(bootstrapField),
        cloudinaryName: process.env.CLOUDINARY_NAME,
        cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
        cloudinaryPreset: process.env.CLOUDINARY_UPLOAD_PRESET
    })
})

router.post('/create', checkIfAuthenticated, async (req, res) => {

    // retrieve one to many
    const allCategories = await Category.fetchAll().map((category) => {
        return [category.get('id'), category.get('name')];
    })
    // retrieve all the tags, many to many
    const allTags = await Tag.fetchAll().map(tag => [tag.get('id'), tag.get('name')]);

    const productForm = createProductForm(allCategories, allTags);
    productForm.handle(req, {
        'success': async (form) => {
            // separate out tags from the other product data
            // as not to cause an error when we create
            // the new product
            let { tags, ...productData } = form.data;
            const product = new Product(productData);
            await product.save();
            // save the many to many relationship
            if (tags) {
                await product.tags().attach(tags.split(","));
            }
            req.flash("success_messages", `New Product ${product.get('name')} has been created`);

            res.redirect('/products');

        },
        'error': async (form) => {
            res.render('products/create', {
                'form': form.toHTML(bootstrapField)
            })
        }
    })
})

router.get('/:product_id/update', async (req, res) => {
    // retrieve the product
    const productId = req.params.product_id
    const product = await Product.where({
        'id': parseInt(productId)
    }).fetch({
        require: true,
        withRelated: ['tags'] // is it because that is many to may relation?
    });

    // fetch all the tags
    const allTags = await Tag.fetchAll().map(tag => [tag.get('id'), tag.get('name')]);

    // fetch all the categories
    const allCategories = await Category.fetchAll().map((category) => {
        return [category.get('id'), category.get('name')];
    })

    const productForm = createProductForm(allCategories, allTags);

    // fill in the existing values
    productForm.fields.name.value = product.get('name');
    productForm.fields.cost.value = product.get('cost');
    productForm.fields.description.value = product.get('description');
    productForm.fields.category_id.value = product.get('category_id');
    // 1 - set the image url in the product form
    productForm.fields.image_url.value = product.get('image_url');

    // fill in the multi-select for the tags
    let selectedTags = await product.related('tags').pluck('id');
    productForm.fields.tags.value = selectedTags;

    res.render('products/update', {
        'form': productForm.toHTML(bootstrapField),
        'product': product.toJSON(),
        // 2 - send to the HBS file the cloudinary information
        cloudinaryName: process.env.CLOUDINARY_NAME,
        cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
        cloudinaryPreset: process.env.CLOUDINARY_UPLOAD_PRESET
    })

})

// update 
router.post('/:product_id/update', async (req, res) => {
    // fetch all the categories
    const allCategories = await Category.fetchAll().map((category) => {
        return [category.get('id'), category.get('name')];
    })
    

    // fetch the product that we want to update
    const product = await Product.where({
        'id': req.params.product_id
    }).fetch({
        require: true,
        withRelated: ['tags']
    });

    // process the form
    const productForm = createProductForm(allCategories);
    productForm.handle(req, {
        'success': async (form) => {
            let { tags, ...productData } = form.data;
            product.set(productData);
            product.save();

            // update the tags

            let tagIds = tags.split(',');
            let existingTagIds = await product.related('tags').pluck('id');

            // remove all the tags that aren't selected anymore
            let toRemove = existingTagIds.filter(id => tagIds.includes(id) === false);
            await product.tags().detach(toRemove);

            // add in all the tags selected in the form
            await product.tags().attach(tagIds);

            res.redirect('/products');
        },
        'error': async (form) => {
            res.render('products/update', {
                'form': form.toHTML(bootstrapField),
                'product': product.toJSON()
            })
        }
    })

})

//delete 
router.get('/:product_id/delete', async (req, res) => {
    // fetch the product that we want to delete
    const product = await Product.where({
        'id': req.params.product_id
    }).fetch({
        require: true
    });

    res.render('products/delete', {
        'product': product.toJSON()
    })

});

router.post('/:product_id/delete', async (req, res) => {
    // fetch the product that we want to delete
    const product = await Product.where({
        'id': req.params.product_id
    }).fetch({
        require: true
    });
    await product.destroy();
    res.redirect('/products')
})

module.exports = router;