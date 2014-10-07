var fs 			= require('fs');
var app 		= null;




exports.init = function(_app){
	app = _app;

};




exports.projectsList = function(data, socket){
	
	app.projects.projectsList(function(result){
		socket.emit('projectsList', { result: result });
	});

	console.log('-->projectsList');
};


exports.projectsCreate = function(data, socket){


	if (app.config.publicMode)
		return false;

	//first make a db entry for it
	app.projects.projectsCreate(data,function(result){


		console.log("result= ",result);

		if (result){

			//then make the database and load it, result = the uuid
			app.dataStore.open(result);
			app.io.sockets.emit('projectsUpdate', { result: result });
			console.log('sent projectsUpdate');


		}
		app.io.sockets.emit('projectsUpdate', { result: result });


	});

	console.log('-->projectsCreate');
};

exports.projectsIngest = function(data,socket){

	if (app.config.publicMode)
		return false;
	console.log('-->projectsIngest');



	app.projects.projectsIngest(data,function(result){

		console.log("done");


	});



};

exports.usersPresent = function(data,socket){
	console.log('-->usersPresent');

	app.projects.openUsers.push(data);

};



exports.projectsSendRecord = function(dbid, socket){
	
	app.projects.projectsSendRecord(dbid, function(result){
		socket.emit('projectsSendRecordResponse', { result: result });

	});

	console.log('-->projectsSendRecord');
};

//when the user sends a completed record in
exports.projectsResult = function(data, socket){
	
	app.projects.projectsResult(data);

	console.log('-->projectsResult');
};



