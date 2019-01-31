let express = require("express");
let router = express.Router();
const bcrypt = require("bcryptjs");
const passport = require("passport");
let database = require("../../.secrets/database");

// Reset Email Dependencies
const async = require("async");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

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
                                // we have to use the flash msg b/c we're redirecting so we're storing it in the session
                                req.flash(
                                    "success_msg",
                                    "You are now registered and can log in"
                                );
                                res.redirect("/users/login");
                            })
                            .catch(err => console.log(err));
                    })
                );
            }
        });
    }
});

router.post("/login", (req, res, next) => {
    passport.authenticate("local", {
        successRedirect: "/dashboard",
        failureRedirect: "/users/login",
        failureFlash: true
    })(req, res, next);
});

router.get("/logout", (req, res) => {
    console.log("req: ", req);
    req.logout();
    req.flash("success_msg", "You are logged out");
    res.redirect("/users/login");
});

router.get("/forgot", (req, res) => {
    console.log("database: ", database.email);
    res.render("forgot");
});

router.post("/forgot", (req, res, next) => {
    // TODO email cannot be blank

    //check user exists
    User.findOne({ email: req.body.email }).then(user => {
        if (!user) {
            req.flash("error_msg", "No account with that email address");
            return res.redirect("/users/forgot");
        } else {
            const token = crypto.randomBytes(20).toString("hex");

            user.resetPasswordToken = token;
            user.resetPasswordExpires = Date.now() + 360000;

            user.save(function(err, user) {
                if (err) throw err;
                console.log("saved user: ", user);
            });

            let transporter = nodemailer.createTransport({
                host: database.host,
                port: 587,
                secure: false, // true for 465, false for other ports
                auth: {
                    user: database.email, // generated ethereal user
                    pass: database.password // generated ethereal password
                },
                logger: true
            });

            let mailOptions = {
                from: `"CB website" <${database.email}>`, // sender address
                to: user.email, // list of receivers
                subject: "Password reset request", // Subject line
                text: "Hello world?", // plain text body
                html: `Hello <strong>${
                    user.name
                }</strong><br><br>You recently requested a password reset link. Please click <a href="http://localhost:3000/resetpassword/${
                    user.resetPasswordToken
                }">here</a> to reset your password.` // html body
            };

            // console.log("user", user);
            transporter.sendMail(mailOptions, (err, response) => {
                if (err) {
                    console.log("sendmail error: ", err);
                } else {
                    req.flash(
                        "success_msg",
                        `A password reset link has been sent to ${
                            user.email
                        }. It may take a few minutes to arrive`
                    );
                    res.redirect("/users/forgot");
                }
            });
        }
    });
});

module.exports = router;
