var levelup 	= require('levelup');
var uuid 		= require('node-uuid');
var ensureDir 	= require('ensureDir');


module.exports = function(app){



	dataStore = {



		databases : {},


		recordModel: {


			id : null,						//internal id
			batchId : null,					//ingest batch id
			statusLookup : {},				//has it been run through the apis
			type: {},						//what has the api said about it
			statusWorking: false,			//is someone working on it right now
			statusWorkingStart: null,		//when that happen so we can reset it later if need be
			results : {},					//datamodel coming back from the API results
			touched: [],					//the users touched this record

			localId : null,
			localTerm: null,
			localQual: null,
			localHint: []



		},



		init: function(){

			var self = this;

			ensureDir('./data/database/', 0755, function (err) {
				if (err){
					console.error("We could not make the database store directory.");
					console.log(err);
					app.io.sockets.emit("error","Error: We could not make the database directory.");
				}
			});
		
		},


		open: function(id){

			//do we have it open already?

			if (!this.databases[id]){

				//no, open/create it
				this.databases[id] = levelup(app.config.databasePath + id, { valueEncoding: 'json' }, function (err) {
					if (err){
						console.error("We could not open the project database.");
						console.log(err);
						app.io.sockets.emit("error","Fatal Error: The requested project database could not be open.");
					}
				});


			}


		},


		recordAdd: function(dbid,record,callback){


			this.databases[dbid].put(record.id, record, function (err) {
			 
				if (err){
					console.error("We could not write a record to the database.");
					console.log(err);
					app.io.sockets.emit("error","Error: unable to write to the database.");
					return false;
				}

				if (callback){
					callback();
				}
				

			 });


		},


		// recordUpdate: function(record){

		// 	var self = this;

		// 	console.log("update", record.localTerm)

		// 	this.databases[record.dbid].del(record.id, function (err) {

		// 		if (err){
		// 			console.error("We could not delete a record to the database.");
		// 			console.log(err);
		// 			app.io.sockets.emit("error","Error: unable to delete to the database.");
		// 			return false;
		// 		}


		// 		console.log("deleted!");

		// 		self.recordAdd(record.dbid, record);



		// 	});



		// },


		updateTotals: function(dbid,callback){


			var totalTerms = 0,	totalTermsLeft=0,totalTermsLeftToApi=0,totalTermsApied=0,totalDone =0;

			this.databases[dbid].createReadStream()

				.on('data', function (data) {

					data = data.value;

					totalTerms++;

					var allDone = true;
					var allApied = true

					for (var key in data.statusLookup) {


						if (data.statusLookup[key] != 'done' )
							allDone = false

						if (typeof data.results[key] == 'undefined')
							allApied = false
						
					}

					if (!allDone){
						totalTermsLeft++
					}else{
						totalDone++
					}

					if (allApied){
						totalTermsApied++
					}else{
						totalTermsLeftToApi++
					}


				})
				.on('error', function (err) {
					console.log('projectsList Read Error:', err)
					app.io.sockets.emit("error","Fatal Error: The projects database could not be read.");
				})
				.on('close', function () {

					//send back the status info
					callback(dbid, totalTerms,totalTermsLeft,totalTermsLeftToApi,totalTermsApied,totalDone);

				});

		},



		returnApiQueue: function(api,numberNeeded,callback){


			var results = [];

			//loop through all the open databases looking for possible records to queue
			for (x in app.projects.openProjects){

				var dbid = app.projects.openProjects[x];

				this.databases[dbid].createReadStream()

					.on('data', function (data) {

						if (results.length >= numberNeeded)
							return false;


						//does this record have a done status for this api type
						data = data.value;

						data.dbid = dbid;


						if (data.statusLookup[api]){

							if (data.statusLookup[api] != 'done' && data.statusLookup[api] != 'ready'){

								results.push(data);

							}

						}else{


							//if it doesn't even have that api status, then it needs to be processed
							results.push(data);


						}


					})
					.on('error', function (err) {
						console.log('projectsList Read Error:', err)
						app.io.sockets.emit("error","Fatal Error: A project database could not be read.");
					})
					.on('close', function () {

						//send back the status info
						callback(results);


					});



			}



		},

		returnEnrichQueue: function(enrichName,numberNeeded,callback){


			var results = [];

			//loop through all the open databases looking for possible records to queue
			for (x in app.projects.openProjects){

				var dbid = app.projects.openProjects[x];

				this.databases[dbid].createReadStream()

					.on('data', function (data) {

						if (results.length >= numberNeeded)
							return false;


						//does this record's names have an enrichment
						data = data.value;

						if (data.results){

							for (var aApi in data.results){


								if (data.results[aApi]){

									for (var aName in data.results[aApi]){

										if (data.results[aApi][aName]){

											//if not enriched at all or this enrichment type is not done
											if (!data.results[aApi][aName]['enrichment']){
												results.push(data);
												break
											}else if (!data.results[aApi][aName]['enrichment'][enrichName]){
												results.push(data);
												break
											}
										}

									}

								}



							}


						}




					})
					.on('error', function (err) {
						console.log('projectsList Read Error:', err)
						app.io.sockets.emit("error","Fatal Error: A project database could not be read.");
					})
					.on('close', function () {

						//send back the status info
						callback(results);


					});



			}



		},


		populateWorkQueue: function(currentQueue, dbid, numberNeeded, callback){

			var results = [];

			this.databases[dbid].createReadStream()

				.on('data', function (data) {



					
					if (results.length >= numberNeeded)
						return false;


					//does this record have a done status for this api type
					data = data.value;

					data.dbid = dbid;

					var ready = true;

					for (var aApi in app.config.apiNames){

						var api = app.config.apiNames[aApi];

						
						if (data.statusLookup[api]){

							if (data.statusLookup[api] != 'ready'){

								ready = false;

							}

						}else{
							ready = false;
						}


					}


					if (ready){

						if (!currentQueue[data.id]){
							results.push(data);
						}

						
					}


				})
				.on('error', function (err) {
					console.log('projectsList Read Error:', err)
					app.io.sockets.emit("error","Fatal Error: A project database could not be read.");
				})
				.on('close', function () {

					//send back the status info

					callback(results);


				});



		}







	};




	app.dataStore = dataStore;

	app.dataStore.init();



};