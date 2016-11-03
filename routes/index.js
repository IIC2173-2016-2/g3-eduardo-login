var express = require('express');
var router = express.Router();
var path = require('path');
var handlebars = require('handlebars');
var fs = require('fs');
var app = express();

// respond with "hello world" when a GET request is made to the homepage

// Get Homepage
router.get('/', ensureAuthenticated, function(req, res){
	var template = fs.readFile(path.join(__dirname, '../views/index.handlebars'), 'utf8', function(err, source){
		var templateScript = handlebars.compile(source);
		foursquare_venues(function(venues){
			var context = {'venues' : venues};
			var html = templateScript(context);
			res.render('index', {
				venues:venues
			});
		});
	});
});

router.get("/string", function(req, res) {
    var strings = ["rad", "bla", "ska"]
    var n = Math.floor(Math.random() * strings.length)
    res.send(strings[n])
})

function foursquare_venues(callback, lat, long)
{
//	console.log('entro al foursquare');
	https = require("https")
	var lat = -33.4196897;
	var long = -70.6075518;

	var body = [];
	var venues;

	var options = {
		host: 'api.foursquare.com',
		path: '/v2/venues/search?client_id='+ process.env.CLIENT_ID + '&client_secret=' +process.env.CLIENT_SECRET+'&ll='+lat+','+long
	};

	https.request(options, function(res){
		res.on('data', function(chunk){
			body.push(chunk);
		});
		res.on('end', function(){
			body = Buffer.concat(body).toString();
			venues = JSON.parse(body)['response']['venues'];
			callback(venues);
		});
	}).end();
}

function ensureAuthenticated(req, res, next){
	if(req.isAuthenticated()){
		return next();
	} else {
		//req.flash('error_msg','You are not logged in');
		res.redirect('/users/login');
	}
}

module.exports = router;
