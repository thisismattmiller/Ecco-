var express 	= require("express");
var compress    = require('compression');
var path 		= require('path');
var levelup 	= require('levelup')




//var routes 		= require('./routes')

var app = express();
var port = 9999;


app.use(require('connect-assets')({src: "public"}));
app.use(express.static(process.cwd() + '/public'));


app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(compress());

var config = require('./modules/config')(app);

var dataStore = require('./modules/dataStore.js')(app);
var projects = require('./modules/projects')(app);
var utils = require('./modules/utils')(app);


var apiViaf = require('./modules/api_viaf')(app);
var enrichWiki = require('./modules/enrich_wikipedia')(app);





app.use(express.static(path.join(__dirname, 'public')));

configData = function(req, res, next) {
  res.locals.configs = req.app.config;
  next();
};


app.get("/", configData,  function(req, res){
    res.render("index");
});
 


app.io = require('socket.io').listen(app.listen(port));
console.log("Listening on port " + port);




//all of our "routes" live here
var routesProjects = require('./routes/projects');



var allRoutes = [routesProjects];



//init
allRoutes.forEach(function(a){a.init(app)});



app.io.sockets.on('connection', function (socket) {


    //socket.emit('message', { message: 'welcome to the chat' });



	for (aRoute in allRoutes){
		Object.keys(allRoutes[aRoute]).forEach(function(key) {
			var fn = allRoutes[aRoute][key];
			socket.on(key, function (data) {
				fn(data,socket);
			});
		});
	}



});

