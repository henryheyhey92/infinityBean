const jwt = require('jsonwebtoken');
// ..snipped
const checkIfAuthenticatedJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split(' ')[1];
        jwt.verify(token, process.env.TOKEN_SECRET, function(err, payload){
            if (err) {
            console.log("What is the error :", err);
                return res.sendStatus(403);
            }

            req.user = payload;
            next();
        });
    } else {
        res.sendStatus(401);
    }
};

const checkIfAuthenticated = (req, res, next) => {
    if (req.session.user) {
        next()
    } else {
        req.flash("error_messages", "You need to sign in to access this page");
        res.redirect('/users/login');
    }
}

module.exports = {
    checkIfAuthenticated,
    checkIfAuthenticatedJWT,
}