function isAuthenticated(req, res, next) {
    if (req.session.adminId) {
        return next();
    }
    res.redirect('/login');
}

module.exports = isAuthenticated;
