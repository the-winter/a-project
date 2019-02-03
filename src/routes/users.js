let express = require("express");
let router = express.Router();
const bcrypt = require("bcryptjs");
const passport = require("passport");
let database = require("../../.secrets/database");
let whitelist = require("../../.secrets/allow");
var moment = require("moment");

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
    // check if registered email whitelisted
    if (email) {
        const enteredEmail = email;
        const exists = whitelist.filter(email => {
            return email.email === enteredEmail;
        });
        // if not on whitelist then user may not register
        if (exists.length < 1) {
            // notify me of the registration attempt
            let transporter = nodemailer.createTransport({
                host: database.host,
                port: 587,
                secure: false, // true for 465, false for other ports
                auth: {
                    user: database.email,
                    pass: database.password
                },
                logger: true
            });

            let mailOptions = {
                from: `"CB website" <${database.email}>`, // sender address
                to: database.personal, // list of receivers
                subject: "Unathorized registration attempt", // Subject line
                text: "hi", // plain text body
                html: `${enteredEmail} attempted to register an account.` // html body
            };

            transporter.sendMail(mailOptions, (err, response) => {
                if (err) {
                    console.log("sendmail error: ", err);
                }
            });

            return res.send(
                "Sorry that email address does not exist in our database. Registration is only available for members"
            );
        }
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
    req.logout();
    req.flash("success_msg", "You are logged out");
    res.redirect("/users/login");
});

router.get("/forgot", (req, res) => {
    res.render("forgot");
});

router.post("/forgot", (req, res, next) => {
    //check user exists
    User.findOne({ email: req.body.email }).then(user => {
        if (!user) {
            req.flash("error_msg", "No account with that email address");
            return res.redirect("/users/forgot");
        } else {
            const token = crypto.randomBytes(20).toString("hex");

            user.set({ resetPasswordToken: token });
            user.set({ resetPasswordExpires: Date.now() + 360000 });

            user.save(function(err, user) {
                if (err) throw err;
            });

            let transporter = nodemailer.createTransport({
                host: database.host,
                port: 587,
                secure: false, // true for 465, false for other ports
                auth: {
                    user: database.email,
                    pass: database.password
                },
                logger: true
            });

            let mailOptions = {
                from: `"CB website" <${database.email}>`, // sender address
                to: user.email, // list of receivers
                subject: "Password reset request", // Subject line
                text: "stuff", // plain text body
                html: `Hello <strong>${
                    user.name
                }</strong><br><br>You recently requested a password reset link. Please click <a href="http://localhost:3000/users/resetpassword/${
                    user.resetPasswordToken
                }">here</a> to reset your password.` // html body
            };

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

router.get("/resetpassword/:token", (req, res) => {
    // TODO whats wrong with the resetpasswordexpires line? it doesnt work

    User.findOne({
        resetPasswordToken: req.params.token
        // resetPasswordExpires: { $gt: Date.now() }
    }).then(user => {
        if (!user) {
            req.flash("error_msg", "Password token invalid or has expired");
            return res.redirect("/users/forgot");
        } else {
            res.render("reset", { token: req.params.token });
            // check token is valid
            // moment('2010-10-20').isSameOrBefore('2010-10-21');
        }
    });
});

router.post("/resetpassword/:token", (req, res) => {
    // find the user

    // TODO make it work with resetpasswordexpires
    User.findOne({
        resetPasswordToken: req.params.token
        // resetPasswordExpires: { $gte: Date.now() }
    }).then(user => {
        // if no user, redirect to forgot password page
        if (!user) {
            req.flash("error_msg", "Password token invalid or has expired");
            return res.redirect("/users/forgot");
        } else {
            const { password, password2 } = req.body;
            let errors = [];
            // //first do password validation
            // // 1 check required fields
            if (!password || !password2) {
                errors.push({ msg: "Please fill in all fields" });
            }
            // 2 check passwords match
            if (password !== password2) {
                errors.push({ msg: "Passwords do not match" });
            }
            // 2 check pass length
            if (password.length < 6) {
                errors.push({
                    msg: "Password should be at least 6 characters"
                });
            }
            if (errors.length > 0) {
                //TODO render these errors instead of flash
                errors.forEach(error => {
                    req.flash("error_msg", error.msg);
                });
                return res.redirect("/users/resetpassword/" + req.params.token);
            } else {
                // Hash Password
                bcrypt.genSalt(10, (err, salt) =>
                    bcrypt.hash(password, salt, (err, hash) => {
                        if (err) throw err;
                        //set password to hashed
                        //save user
                        user.set({ password: hash });
                        user.set({ resetPasswordToken: undefined });
                        user.set({ resetPasswordExpires: undefined });
                        user.save()
                            .then(user => {
                                // we have to use the flash msg b/c we're redirecting so we're storing it in the session
                                req.flash(
                                    "success_msg",
                                    "You have successfully reset your password"
                                );
                                res.redirect("/users/login");
                            })
                            .catch(err => console.log(err));
                    })
                );
            }
        }
    });
});

module.exports = router;
