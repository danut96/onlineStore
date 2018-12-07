const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const session = require('express-session');
var MySQLStore = require('express-mysql-session')(session);
var flash = require('connect-flash');

const app = express();

app.set('views',  'client/views');
app.use(express.static('client/scripts'));
app.use(express.static('client/style'));
app.use(express.static('client/assets'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json()); 
app.set('view engine', 'ejs');


app.listen(process.env.PORT || 3000, () => {
    console.log('server is running')
});

require('./login')(passport);

app.use(cookieParser());

var options = {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'password',
    database: 'online_store'
};

var sessionStore = new MySQLStore(options);

app.use(session({
	secret: 'asjfheirbframlcamij4fpoewmfyuw948295rm',
	resave: false,
	store: sessionStore,
	saveUninitialized: false,
	//cookie: { secure: true }
  }));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

require('./api.js')(app, passport);
