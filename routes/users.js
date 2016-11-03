var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var User = require('../models/user');

function ensureAuthenticated(req, res, next){
	if(req.isAuthenticated()){
		res.redirect('./');
	} else {
		return next();
	}
}

router.get('/',function(req,res){
	res.redirect('/dashboard');
});

// Register
router.get('/register', function(req, res){
	res.render('register');
});

// Login
router.get('/login',ensureAuthenticated, function(req, res){
	res.render('login');
});

// Register User
router.post('/register', function(req, res){
	var name = req.body.name;
	var email = req.body.email;
	var username = req.body.username;
	var password = req.body.password;
	var password2 = req.body.password2;
	var address = req.body.address;
	var bloodtype = req.body.bloodtype;
	var birthday = req.body.birthday;
	var cardnumber = req.body.cardnumber;
	var cvs = req.body.cvs;
	var accounttype = req.body.accounttype;

	// Validation
	req.checkBody('name', 'Name is required').notEmpty();
	req.checkBody('email', 'Email is required').notEmpty();
	req.checkBody('email', 'Email is not valid').isEmail();
	req.checkBody('username', 'Username is required').notEmpty();
	req.checkBody('address', 'Address is required').notEmpty();
	req.checkBody('bloodtype', 'Blood type is required').notEmpty();
	req.checkBody('accounttype', 'Account type is required').notEmpty();
	req.checkBody('cardnumber', 'Card Number is required and should have 16 digits').notEmpty().len(16);
	req.checkBody('cvs', 'Card Verification Number is required and should have 3 digits').notEmpty().len(3);
	req.checkBody('password', 'Password is required').notEmpty();
	req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

	var errors = req.validationErrors();

	if(errors){
		res.render('register',{
			errors:errors
		});
	} else {
		var newUser = new User({
			name: name,
			email:email,
			address: address,
			bloodtype: bloodtype,
			accounttype: accounttype,
			cardnumber: cardnumber,
			cvs: cvs,
			username: username,
			password: password

		});

		User.createUser(newUser, function(err, user){
			if(err) throw err;
			console.log(user);
		});

		req.flash('success_msg', 'You are registered and can now login');

		res.redirect('./login');
	}
});

passport.use(new LocalStrategy(
  function(username, password, done) {
   User.getUserByUsername(username, function(err, user){
   	if(err) throw err;
   	if(!user){
   		return done(null, false, {message: 'Unknown User'});
   	}

   	User.comparePassword(password, user.password, function(err, isMatch){
   		if(err) throw err;
   		if(isMatch){
   			return done(null, user);
   		} else {
   			return done(null, false, {message: 'Invalid password'});
   		}
   	});
   });
  }));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.getUserById(id, function(err, user) {
    done(err, user);
  });
});

router.post('/login',
  passport.authenticate('local', {successRedirect:'/dashboard', failureRedirect:'./login',failureFlash: true}),
  function(req, res) {
    res.redirect('./');
  });

router.get('/logout', function(req, res){
	req.logout();

	req.flash('success_msg', 'You are logged out');

	res.redirect('./login');
});

module.exports = router;
