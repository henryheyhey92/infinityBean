const express = require("express");
const router = express.Router(); // #1 - Create a new express Router


//  #2 Add a new route to the Express router
router.get('/', (req,res)=>{
    res.send("Welcome")
})

module.exports = router; // #3 export out the router