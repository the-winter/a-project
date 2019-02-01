module.exports = {
    //add this to any route you want to protect
    // all this stuff is coming from passport
    ensureAuthenticated: function(req, res, next) {
        console.log("isauthed: ", req.session.passport);
        if (req.isAuthenticated()) {
            res.locals.login = req.session.passport;
            return next();
        } else {
            res.locals.login = undefined;
            req.flash("error_msg", "Please log in to view this resource");
            res.redirect("/users/login");
        }
    }
};
