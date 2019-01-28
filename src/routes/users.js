let express = require("express");
let router = express.Router();
const bcrypt = require("bcryptjs");

// User Model
const User = require("../models/User");

// Login Page
router.get("/login", (req, res) => {
    res.render("login");
});

// Register Page
router.get("/register", (req, res) => {
    res.render("register");
});

// Register Handle
router.post("/register", (req, res) => {
    const { name, email, password, password2 } = req.body;
    let errors = [];
    console.log("body: ", req.body);

    //Validations

    // 1 check required fields
    if (!name || !email || !password || !password2) {
        errors.push({ msg: "Please fill in all fields" });
    }

    // 2 check passwords match
    if (password !== password2) {
        errors.push({ msg: "Passwords do not match" });
    }

    // 2 check pass length
    if (password.length < 6) {
        errors.push({ msg: "Password should be at least 6 characters" });
    }

    if (errors.length > 0) {
        // we dont want the form to completely clear
        res.render("register", {
            errors,
            name,
            email,
            password,
            password2
        });
    } else {
        // validation passed
        User.findOne({ email: email }).then(user => {
            if (user) {
                // User exists
                errors.push({ msg: "email is already registered" });
                res.render("register", {
                    errors,
                    name,
                    email,
                    password,
                    password2
                });
            } else {
                const newUser = new User({
                    name,
                    email,
                    password // password is plain text like this
                });

                // Hash Password
                // generate a saltso we can create a hash with gensalt
                bcrypt.genSalt(10, (err, salt) =>
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if (err) throw err;
                        //set password to hashed
                        newUser.password = hash;
                        //save user
                        newUser
                            .save()
                            .then(user => {
                                res.redirect("/users/login");
                            })
                            .catch(err => console.log(err));
                    })
                );
            }
        });
    }
});

module.exports = router;
