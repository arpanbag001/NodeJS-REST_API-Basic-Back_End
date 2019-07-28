const exporess = require("express");
const { body } = require("express-validator");

const User = require("../models/user");
const authController = require("../controllers/auth");

const router = exporess.Router();

router.put("/signup", [
    body("email")
        .isEmail().withMessage("Please enter a valid email.")
        .custom((value, { req }) => {
            return User.findOne({ email: value }).then(user => {
                if (user)    //User already exists
                    return Promise.reject("Email address already exists");
            })
        })
        .normalizeEmail(),
    body("password").trim().isLength({ min: 5 }),
    body("name").trim().not().isEmpty()
], authController.signup);

router.post("/login", authController.login);

module.exports = router;