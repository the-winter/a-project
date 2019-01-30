const LocalStrategy = require("passport-local").Strategy;
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// load user model
const User = require("../src/models/User");

module.exports = passport => {
    passport.use(
        new LocalStrategy(
            { usernameField: "email" },
            (email, password, done) => {
                //Match User
                User.findOne({
                    email: email
                })
                    .then(user => {
                        // if theres no match
                        //this line is 'skipped' if there is a match
                        if (!user) {
                            // message shown via req flash?
                            return done(null, false, {
                                message: "That email is not registered"
                            });
                        }

                        //Match Password
                        //comparing entered password to hashed password
                        bcrypt.compare(
                            password,
                            user.password,
                            (err, isMatch) => {
                                if (err) throw err;

                                if (isMatch) {
                                    return done(null, user);
                                } else {
                                    // message shown via req flash?
                                    return done(null, false, {
                                        message: "Password incorrect"
                                    });
                                }
                            }
                        );
                    })
                    .catch(err => console.log(err));
            }
        )
    );

    //sessions
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser((id, done) => {
        User.findById(id, (err, user) => {
            done(err, user);
        });
    });
};
