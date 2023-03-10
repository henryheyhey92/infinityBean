const express = require("express");
const hbs = require("hbs");
const wax = require("wax-on");
const cors = require('cors');
const csrf = require('csurf');
require("dotenv").config();


//for session
const session = require('express-session');
const flash = require('connect-flash');
const FileStore = require('session-file-store')(session);

// create an instance of express app
let app = express();

// set the view engine
app.set("view engine", "hbs");

// static folder
app.use(express.static("public"));

// setup wax-on
wax.on(hbs.handlebars);
wax.setLayoutPath("./views/layouts");

// enable forms
app.use(
    express.urlencoded({
        extended: false
    })
);
app.use(cors()); //make sure to enable cors before sessions

// set up sessions
app.use(session({
    store: new FileStore(),
    secret: process.env.SESSION_SECRET_KEY,
    resave: false,
    saveUninitialized: true
}))

app.use(flash())

// Register Flash middleware
app.use(function (req, res, next) {
    res.locals.success_messages = req.flash("success_messages");
    res.locals.error_messages = req.flash("error_messages");
    next();
});

// Share the user data with hbs files
app.use(function(req,res,next){
    res.locals.user = req.session.user;
    next();
})

// enable CSRF
// app.use(csrf());
const csurfInstance = csrf();
app.use(function(req,res,next){
  console.log("checking for csrf exclusion")
  // exclude whatever url we want from CSRF protection
  if (req.url === "/checkout/process_payment" || req.url.slice(0,5)=="/api/") {
    return next();
  }
  csurfInstance(req,res,next);
})


// Share CSRF with hbs files
app.use(function(req,res,next){
    if (req.csrfToken) {
        res.locals.csrfToken = req.csrfToken();
    }
    next();
})

// import in routes
const landingRoutes = require('./routes/landing');
const productRoutes = require('./routes/products');
const userRoutes = require('./routes/users');
const cloudinaryRoutes = require('./routes/cloudinary.js')
const shoppingCartRoutes = require('./routes/shoppingCart');
const checkoutRoutes = require('./routes/checkout');

const api = {
    products: require('./routes/api/products'),
    users : require('./routes/api/users')
}


async function main() {
    // app.get('/', (req, res) => {
    //     res.send("It's alive!")
    // })
    
    app.use('/', landingRoutes);
    app.use('/products', productRoutes);
    app.use('/users', userRoutes);
    app.use('/cloudinary', cloudinaryRoutes);
    app.use('/cart', shoppingCartRoutes);
    app.use('/checkout', checkoutRoutes);
    app.use('/api/products', express.json(), api.products);
    app.use('/api/users', express.json(), api.users);

}

main();

app.listen(3000, () => {
    console.log("Server has started");
});