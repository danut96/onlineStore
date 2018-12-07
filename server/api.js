var User = require('./db.js').User;

module.exports = function(app, passport){

    function authenticationMiddleware(){
        return (req, res, next) => {
            if(req.isAuthenticated()) return next();
            res.redirect('/login');
        }
    }

    app.get('/', (req, res) => {
        User.findAll().then(users => {
            console.log(users);
        });
    });

    app.get('/login', (req, res) => {
        res.render('login.ejs', { message: req.flash('loginMessage')});
    });

    app.get('/signup', (req, res) => {
        res.render('signup.ejs', { message: req.flash('signupMessage')});
    });

    // SIGNUP
    app.post('/signUp', passport.authenticate('local-signup', {
        successRedirect: '/index',
        failureRedirect: '/signup',
        failureFlash: true // allow flash messages
    }));

    //LOGIN
    app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/index', 
        failureRedirect : '/login', 
        failureFlash : true // allow flash messages
    }));

    // LOGOUT
    app.get('/logout',(req, res, next) => {
        req.logOut();
        req.session.destroy();
        res.redirect('/login');
    });
}