var levelup 	= require('levelup');
var uuid = require('node-uuid');


module.exports = function(app){



	projects = {


		openProjects : [],

		openUsers: [],

		workQueue: {},

		workQueueLength : 1000,

		workQueueLock : false,



		init: function(){

			var self = this;

			this.db = levelup(app.config.databasePath + 'projects', { valueEncoding: 'json' }, function (err) {
				if (err){
					console.error("We could not open the projects database.");
					console.log(err);
					self.db = false;
					app.io.sockets.emit("error","Fatal Error: The projects database could not be open.");
				
				}
			});

			self.updateTotals();


			//setup a timer to update the stats on the all the databaes
			setInterval(function(){				
				self.updateTotals();
				self.populateWorkQueue();

				//console.log("work queue = ",Object.keys(self.workQueue).length)

				//console.log(JSON.stringify(self.workQueue,null,4))

			},10000);

			//roll call
			setInterval(function(){ self.projectRollCall()} ,10000);

		


		},

		pruneWorkQueue: function(dbid,id){

			if (this.workQueue[dbid][id]){
				delete this.workQueue[dbid][id];					
			}

		},


		projectsSendRecord: function(data,callback){

			var dbid = data['dbid'];
			var user = data['user']

			var self = this;

			if (self.workQueueLock){

				setTimeout(function(){

					self.projectsSendRecord(dbid,callback);


				}, 50);

				return false;

			}


			self.workQueueLock = true;


			for (x in self.workQueue[dbid]){

				if (self.workQueueLock == false)
					break;

				if (!self.workQueue[dbid][x].statusWorking && self.workQueue[dbid][x].touched.indexOf(user) == -1){

					self.workQueueLock = false;

					self.workQueue[dbid][x].statusWorking = true;
					self.workQueue[dbid][x].statusWorkingStart = Date.now();
					

					callback(self.workQueue[dbid][x]);
					

					return true;

				}


			}

			//we did not send anything.... let them know
			callback({});


			self.workQueueLock = false;



		},

		projectRollCall: function(){	

				var self = this;

				self.openUsers = [];
				app.io.sockets.emit("usersRollCall");

				setTimeout(function(){
					app.io.sockets.emit("usersRollCallResults", self.openUsers.length);
				},1000);

		},


		//update the result
		projectsResult: function(data){

			var self=this;

			//todo fix for multi api

			if (app.config.publicMode){

				if (data.use.length >= app.config.publicConsensus){
					data.statusLookup['viaf'] = 'done';
				}else{
					data.statusLookup['viaf'] = 'ready';
				}

			}else{
				data.statusLookup['viaf'] = 'done';
			}

			//keep a record of who is touching things
			if (!data.touched){
				data.touched = [data.lastTouched]
			}else{
				data.touched.push(data.lastTouched)
			}

				
			console.log(data);

			data.statusWorking=false;

			//console.log(JSON.stringify(data,null,4))


			app.dataStore.recordAdd(data.dbid,data,function(){

				if (self.workQueue[data.dbid][data.id]){
					delete self.workQueue[data.dbid][data.id];					
				}


			});




		},




		projectsList: function(callback){


			var projects = [];

			//itterate over the database to list the available projects			
			this.db.createReadStream()
				.on('data', function (data) {


					projects.push(data.value);
					//make sure it is open
					app.dataStore.open(data.value.id);

				})
				.on('error', function (err) {
					console.log('projectsList Read Error:', err)
					app.io.sockets.emit("error","Fatal Error: The projects database could not be read.");
				})
				.on('close', function () {
					callback(projects);
				});


		},


		projectsCreate: function(data,callback){

			var newProject = {
				id : uuid.v1(),
				name : data.name,
				totalTerms : 0,
				totalTermsLeft : 0,
				totalTermsLeftToApi : 0,
				totalTermsApied : 0,
				color: '#259b24'
			};



			var colors = ["#e91e63", "#9c27b0", "#673ab7", "#009688", "#ff5722", "#795548", "#607d8b"];

			newProject.color = colors[Math.floor(Math.random() * (8 - 0) + 0)];


			this.db.put(newProject.id, newProject, function (err) {


				if (err){
					console.error("We could not store this project in the projects database.");
					console.log(err);
					app.io.sockets.emit("error","Fatal Error: We could not store this project in the projects database.");
					
					callback(false);
					return false;
				}else{

					callback(newProject.id);

					return newProject.id;
				}



			})





		},



		projectsIngest: function(data){


			//make sure it is open
			app.dataStore.open(data.project);


			for (aRecord in data.data){

				if (data.firstRowIsHeaders && aRecord==0){
					continue;					
				}

	
				//the base model
				var record = app.dataStore.recordModel;


				//set the values
				record.id = uuid.v1();
				record.batchId = data.batchId;


				for (x in app.config.apiNames){
					record.statusLookup[app.config.apiNames[x]] = "queued";
				}

				
				for (aDatum in data.data[aRecord]){

					var id = aDatum, value = data.data[aRecord][aDatum];

					//right now we only support one localterm localid, multiple hints
					if (id != 'localHint'){
						record[id] = value[0];
					}else{
						record[id] = value
					}

				}


				//store it
				app.dataStore.recordAdd(data.project, record);


			}


		},

		populateWorkQueue: function(){

			var self = this;
			var projects = [];


			this.db.createReadStream()
				.on('data', function (data) {


					projects.push(data.value.id);


				})
				.on('error', function (err) {
					console.log('projectsList Read Error:', err)
					app.io.sockets.emit("error","Fatal Error: The projects database could not be read.");
				})
				.on('close', function () {



					for (var x in projects ){


						var numberInQueue = 0;


						for (var id in self.workQueue[projects[x]]){
							numberInQueue++;
						}

						var numberNeeded = self.workQueueLength - numberInQueue;

						app.dataStore.populateWorkQueue(self.workQueue[projects[x]], projects[x], numberNeeded, function(itemsToAdd){

							for (var aNewItem in itemsToAdd){

								var item = itemsToAdd[aNewItem];

								if (!self.workQueue[projects[x]][item.id]){
									self.workQueue[projects[x]][item.id] = item;
								}

							}

						});

					}


				});




		},


		updateTotals: function(){

			var self = this;

			var projects = [];



			//itterate over the database to list the available projects	and then asks the datastore to iterate over the records and update the projects db with the totals		
			this.db.createReadStream()
				.on('data', function (data) {


					projects.push(data.value.id);
					//make sure it is open
					app.dataStore.open(data.value.id);

					//keep track of it for other modules
					if (self.openProjects.indexOf(data.value.id) == -1)
						self.openProjects.push(data.value.id);

					//do we have a viable work queue ready for this one
					if (!self.workQueue[data.value.id]){
						self.workQueue[data.value.id] = {};
					}

				})
				.on('error', function (err) {
					console.log('projectsList Read Error:', err)
					app.io.sockets.emit("error","Fatal Error: The projects database could not be read.");
				})
				.on('close', function () {


					for (x in projects){


						//ask the datastore to count everything up and then update the db
						app.dataStore.updateTotals(projects[x], function(dbid, totalTerms, totalTermsLeft, totalTermsLeftToApi, totalTermsApied,totalDone){


							//This is the callback function asking the database to update with the new totals

							self.db.get(dbid, function (err, value) {

								if (err){
									console.error("We read from the projects database.");
									console.log(err);
									app.io.sockets.emit("error","Fatal Error: We could not read from the projects database.");
									return false;
								}else{



									var change = false;

									if (value.totalTerms != totalTerms) change = true;
									if (value.totalTermsLeft != totalTermsLeft) change = true;
									if (value.totalTermsLeftToApi != totalTermsLeftToApi) change = true;
									if (value.totalTermsApied != totalTermsApied) change = true;

									 change = true;

									//update with the new  vars
									value.totalTerms = totalTerms;
									value.totalTermsLeft = totalTermsLeft;
									value.totalTermsLeftToApi = totalTermsLeftToApi;
									value.totalTermsApied = totalTermsApied;
									value.totalDone = totalDone;


									self.db.put(dbid, value, function (err) {

										if (err){
											console.error("We cannot write to the projects database.");
											console.log(err);
											app.io.sockets.emit("error","Fatal Error: We could not write to the projects database.");
											return false;
										}else{

											if (change){
												//announce new totals											
												app.projects.projectsList(function(result){
													app.io.sockets.emit('projectsUpdate', { result: result });
												});
											}

											return true;

										}


									});


									return true

								}


							});

						});

					}

				});

		},











	};




	app.projects = projects;

	app.projects.init();



};