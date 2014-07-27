var express 	= require("express");
var compress    = require('compression');
var path 		= require('path');

//var routes 		= require('./routes')

var app = express();
var port = 3700;


app.use(require('connect-assets')({src: "public"}));


app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(compress());

//app.use(express.static(path.join(__dirname, 'public')));



app.get("/", function(req, res){
    res.render("index");
});




app.get("/", function(req, res){
    res.send("It works!");
});
 
var io = require('socket.io').listen(app.listen(port));
console.log("Listening on port " + port);




//process the data files






io.sockets.on('connection', function (socket) {
    socket.emit('message', { message: 'welcome to the chat' });
    console.log("hey");
    socket.on('send', function (data) {
        io.sockets.emit('message', data);
    });
});

