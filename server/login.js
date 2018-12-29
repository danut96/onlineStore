var LocalStrategy = require('passport-local').Strategy;
var bcrypt = require('bcrypt');
var {
    User,
    Categories,
    Subcategories,
    Products,
    Reviews,
    Orders,
    Address,
    Role
} = require('./db.js');

module.exports = function(passport){

    passport.serializeUser((user, done) => {
        done(null, user.email);
    });

    passport.deserializeUser(function(email, done) {
        User.findAll({where: {
            email: email
        }}).then(user => done(null, user[0]));
    });

    //------------------------- SIGNUP------------------- //
    passport.use('local-signup', new LocalStrategy({
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true
    }, function(req, email, password, done) {
        bcrypt.genSalt(10, function(err, salt) {
            // find or create user
            bcrypt.hash(password, salt, function(err, hash) {
                if(req.body.firstName.trim() === "" || req.body.lastName.trim() === "" || email.trim() === "") return done(null, false, req.flash('signupMessage', 'Please enter a valid name and email.'));
                User.findOrCreate({
                    where: {
                        email: email
                    },
                    defaults: {
                        firstName: req.body.firstName,
                        lastName: req.body.lastName,
                        phone: req.body.phone,
                        password: hash
                    }
                }).spread((user, created) => {
                    if(!created){
                        Role.findOne({where: {userId: user.id}}).then(role => {
                            if(role.role !== 1) return done(null, false, req.flash('signupMessage', 'You already have an account.'));
                            else return done(null, false, req.flash('signupMessage', 'You already have an account. You can become a seller by checking the seller option within your account page.'));
                        });
                }else{
                        Address.create({
                            userId: user.id,
                            content: req.body.address
                        });
                        Role.create({
                            userId: user.id,
                            role: 1
                        });
                        var newUserMysql = new Object();
                        newUserMysql.email = email;
                        newUserMysql.password = hash;
                        return done(null, newUserMysql);
                    }
                });
            });
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
            User.findAll({where: {
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

