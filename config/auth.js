module.exports = {
    //add this to any route you want to protect
    // all this stuff is coming from passport
    ensureAuthenticated: function(req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        }

        req.flash("error_msg", "Please log in to view this resource");
        res.redirect("/users/login");
    }
};
