var LocalStrategy = require('passport-local').Strategy;
var bcrypt = require('bcrypt');
var Users = require('./db').User;

module.exports = function(passport){

    passport.serializeUser((user, done) => {
        done(null, user.email);
    });

    passport.deserializeUser(function(email, done) {
        Users.findAll({where: {
            email: email
        }}).then(user => done(null, user[0]));
    });

    //------------------------- SIGNUP------------------- //
    passport.use('local-signup', new LocalStrategy({
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true
    }, function(req, email, password, done) {
        Users.findAll({where: {
            email: email
        }}).then(user => {
            if(user.length > 0){
                return done(null, false, req.flash('signupMessage', 'You already have an account.'));
            }else{
                bcrypt.genSalt(10, function(err, salt) {
                // create user
                    bcrypt.hash(password, salt, function(err, hash) {
                        var newUserMysql = new Object();
                        newUserMysql.email = email;
                        newUserMysql.password = hash;
                        Users.create({
                            id: req.body.id,
                            firstName: req.body.firstName,
                            lastName: req.body.lastName,
                            email: req.body.email,
                            password: hash,
                            phone: req.body.phone,
                            address: req.body.address
                        }).then(user => {return done(null, newUserMysql)});
                    });
                });
            }
        });
    }));

    //--------------------------LOGIN --------------------//

    passport.use('local-login', new LocalStrategy({
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true
    },
    function(req, email, password, done) {
            // find user
            Users.findAll({where: {
                email: email
            }}).then(user => {
                if(user.length === 0){
                    return done(null, false, req.flash('loginMessage', 'Incorrect email or password. Make sure you have an account and try again.'));
                }else{
                    bcrypt.compare(password, user[0].password, function(err, res) {
                        if(res === true){
                            var newUserMysql = {
                                id: user[0].id,
                                email: user[0].email,
                                firstname: user[0].firstName,
                                lastname: user[0].lastName
                            }
                            return done(null, newUserMysql);
                        }else{
                            return done(null, false, req.flash('loginMessage', 'Incorrect email or password. Make sure you have an account and try again.'));
                        }
                    });
                }
        });
    }));
}

