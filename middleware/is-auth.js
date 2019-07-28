const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
    const authHeader = req.get("Authorization");
    if (!authHeader) {//Authentication header was not found
        const err = new Error("Not authenticated!");
        err.statusCode = 401;
        throw err;
    }
    const token = authHeader.split(" ")[1];
    let decodedToken;
    try {
        decodedToken = jwt.verify(token, "somesecretstring");
    } catch (err) { //Decoding failed
        err.statusCode = 500;
        throw err;
    }
    if (!decodedToken) {  //Decoding was successul, but verification failed
        const err = new Error("Not authenticated!");
        err.statusCode = 401;
        throw err;
    }
    req.userId = decodedToken.userId;
    next();
};