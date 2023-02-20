const express = require('express')
const router = express.Router();
const { Product } = require('../../models');
const { createProductForm } = require('../../forms');


const productDataLayer = require('../../dal/products')

router.get('/', async(req,res)=>{
    res.send(await productDataLayer.getAllProducts())
})

router.post('/', async (req, res) => {
    const allCategories = await productDataLayer.getAllCategories();
    const allTags = await productDataLayer.getAllTags();
    const productForm = createProductForm(allCategories, allTags);

    productForm.handle(req, {
        'success': async (form) => {                    
            let { tags, ...productData } = form.data;
            const product = new Product(productData);
            await product.save();
    
            // save the many to many relationship
            if (tags) {
                await product.tags().attach(tags.split(","));
            }
            res.send(product);
        },
        'error': async (form) => {
           let errors = {};
           for (let key in form.fields) {
               if (form.fields[key].error) {
                   errors[key] = form.fields[key].error;
               }
           }
           res.send(JSON.stringify(errors));
        }
    })

})


module.exports = router;