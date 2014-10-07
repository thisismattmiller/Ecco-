var ensureDir 	= require('ensureDir');
var parseString = require('xml2js').parseString;
var request 	= require('request');
var crypto 		= require('crypto');
var fs 			= require('fs');
var levenshtein = require('fast-levenshtein');

module.exports = function(app){



	apiViaf = {



		intervalLimit : 500,		//ms to wait between api calls

		queueLimit : 100,			//how many things do we hold in memory 

		connectionActive : false,

		apiName: 'viaf',

		apiUrl : 'http://www.viaf.org/viaf/search?query={TYPE}+"{SEARCH}"&sortKeys=holdingscount&maximumRecords=20&httpAccept=text/xml',

		queue: [],



		init: function(){

			var self = this;

			//we want to make sure the directories exist for our stored api responses
			ensureDir('./data/api/viaf', 0755, function (err) {
				if (err){
					console.error("We could not make the api store directory.");
					console.log(err);
					app.io.sockets.emit("error","Error: We could not make the api store directory.");
				}
			});
			ensureDir('./data/api/viaf/cache', 0755, function (err) {
				if (err){
					console.error("We could not make the api store directory.");
					console.log(err);
					app.io.sockets.emit("error","Error: We could not make the api store directory.");
				}
			});



			setInterval(function(){

				self.populateQueue();

			},5000);






		    setInterval(function(){


		    	if (self.connectionActive){
		    		return;
		    	}



				for (var x in self.queue){
					

					if (self.queue[x].statusLookup[self.apiName] == 'queued'){
						console.log(self.queue[x].localTerm);
						self.lookup(self.queue[x]);
						break
					}else{


						//prune it
						self.queue.splice(x, 1);

					}


				}


			},self.intervalLimit);






		
		},


		lookup: function(record){





				var self= this;
				var searchTerm = record.localTerm;


				if (!record.tempSearchOptions){
					record.tempSearchOptions = {}
				}

					//we already tried the localQual, don't use it again
				if (record.tempSearchOptions.termOnly){

					searchTerm = record.localTerm;

				}else if (record.localQual){

					//try it with the qualifier first if it is there

					if (record.localQual != ''){
						searchTerm = record.localTerm + ' ' + record.localQual; 
					}

				}

				//try it with the last name inverse
				if (record.tempSearchOptions.inverseTerm){

					searchTerm = record.localTerm.split(',').slice(1) + ' ' + record.localTerm.split(',')[0];


				}


				//try it with some punctuation removed
				if (record.tempSearchOptions.removePunct){

					searchTerm = record.localTerm.replace(/[\.-\/#!$%\^&\*;:{}=\-_`~()]/g," ");

					searchTerm = searchTerm.replace(/\s+/g,' ');

				}

				//try it with some punctuation removed and numbers!
				if (record.tempSearchOptions.removePunctAndNumbers){

					searchTerm = record.localTerm.replace(/[\.-\/#!$%\^&\*;:{}=\-_`~()]/g," ");

					searchTerm = searchTerm.replace(/\s+/g,' ');

					searchTerm = searchTerm.replace(/[0-9]*/g,'');

					searchTerm = searchTerm.replace(/\s+/g,' ');

				}

				//try it with some punctuation removed and numbers and small words!!!
				if (record.tempSearchOptions.removePunctAndNumbersAndSmallWords){

					searchTerm = record.localTerm.replace(/[\.-\/#!$%\^&\*;:{}=\-_`~()]/g," ");

					searchTerm = searchTerm.replace(/\s+/g,' ');

					searchTerm = searchTerm.replace(/[0-9]*/g,'');

					searchTerm = searchTerm.replace(/\W*\b\w{1,2}\b/g, "");

					searchTerm = searchTerm.replace(/\s+/g,' ');

				}






				//try a stright search
				var url = this.apiUrl.replace('{SEARCH}',searchTerm);


				//we run all these searches using the exact option, if that did not work, use the more fuzzy searching

				if (record.tempSearchOptions.triedExact){
					url = url.replace('{TYPE}','local.names+all');
				}else{
					url = url.replace('{TYPE}','local.names+exact');				
				}



				//we are storing the number of error occurances in the status text
				if (record.statusLookup[this.apiName]){
					if (record.statusLookup[this.apiName].split('_')[1]){
						var statusOld = record.statusLookup[this.apiName].split('_')[0];
						var statusOldNumber = record.statusLookup[this.apiName].split('_')[1];
					}else{
						var statusOld = record.statusLookup[this.apiName];
						var statusOldNumber = false;
					}
				}

				//get the hash
				var lookupCacheHash = ( url.replace(/\s/g, "").toLowerCase() );
				lookupCacheHash = crypto.createHash('md5').update(lookupCacheHash).digest('hex')


				var useCache = false;

				//do we have a local copy of this query already
				if (fs.existsSync('./data/api/viaf/cache/'+lookupCacheHash)) {
					
					var stats = fs.statSync('./data/api/viaf/cache/'+lookupCacheHash);

					//is it older than 30 days?
					var timestamp = new Date(stats.ctime).getTime();
					if (isNaN(timestamp)==false){
						if ( (Date.now() - timestamp) / 86400 <= 30){
							useCache = true;
						}

					}
				}

				console.log("---------------------------------------")
				console.log("TRYING WITH ", searchTerm)
				console.log(url)
				console.log("---------------------------------------")




				if (useCache){

					//console.log("using cache");

					fs.readFile( './data/api/viaf/cache/'+lookupCacheHash, function (err, data) {
						if (err) {
							console.error("Could not read the cache");
							console.log(err);
							return false;

						}

						parseString(data.toString(), function (err, result) {

							if (result == null){

								fs.unlinkSync('./data/api/viaf/cache/'+lookupCacheHash);
								self.lookup(record);
								return false;

							}



							if (result.searchRetrieveResponse){

								if (result.searchRetrieveResponse.numberOfRecords){
									
									self.processResults(result, record)


								}else{

									fs.unlinkSync('./data/api/viaf/cache/'+lookupCacheHash);
									self.lookup(record);
									return false;

								}


							}else{

								fs.unlinkSync('./data/api/viaf/cache/'+lookupCacheHash);
								self.lookup(record);
								return false;


							}


						});




					});



				}else{

					self.connectionActive = true;

					var context = self;

					setTimeout(function(){


						request(url, function (error, response, body) {

							//things went okay
							if (!error && response.statusCode < 400) {

								context.connectionActive = false;

								parseString(body, function (err, result) {

								    //console.dir(result);

								    //test to make sure that the required fields are all here
									if (result.searchRetrieveResponse){

										if (result.searchRetrieveResponse.numberOfRecords){


											//everything looks great, lets do it


											//first save a local copy to the drive
											fs.writeFile("./data/api/viaf/cache/" + lookupCacheHash ,  body, function(err) {
												if(err) {
													console.error("Could not write to cache");
													console.log(err);
												}
											}); 


											context.processResults(result, record)




										}else{
											if (statusOldNumber!=false){
												record.statusLookup[context.apiName] = "error_" + ++statusOldNumber;
											}else{
												record.statusLookup[context.apiName] = "error_1";
											}							
										}
									}else{
										if (statusOldNumber!=false){
											record.statusLookup[context.apiName] = "error_" + ++statusOldNumber;
										}else{
											record.statusLookup[context.apiName] = "error_1";
										}
									}

									//console.log(record);

								});


							}else{

								context.connectionActive = false;

								if (response){

									//some problems, if it forbiden then it might be we are requesting too much
									if (response.statusCode > 400 && response.statusCode < 500){

										//todo ajust request timining

										if (statusOldNumber!=false){
											record.statusLookup[context.apiName] = "error_" + ++statusOldNumber;
										}else{
											record.statusLookup[context.apiName] = "error_1";
										}

									}

								}else{


									if (statusOldNumber!=false){
										record.statusLookup[context.apiName] = "error_" + ++statusOldNumber;
									}else{
										record.statusLookup[context.apiName] = "error_1";
									}




								}


							}

						});

					}, this.intervalLimit);
					
				}


				//console.log(url);

			


		},


		processResults: function(data,record){



			data = data.searchRetrieveResponse;

			var numberOfRecords = data.numberOfRecords[0]['_'];

			//console.log(numberOfRecords);

			if (numberOfRecords == 0){


				if (!record.tempSearchOptions){
					record.tempSearchOptions = {}
				}

				if (!record.tempSearchOptions.termOnly){

					//try it this time with only the term
					record.tempSearchOptions.termOnly = true;
					this.lookup(record);

				}else if (!record.tempSearchOptions.inverseTerm && record.localTerm.search(',') > -1){


						record.tempSearchOptions.inverseTerm = true;
						this.lookup(record);

					//other possible searchs go here

				}else if (!record.tempSearchOptions.removePunct){

					record.tempSearchOptions.removePunct = true;
					this.lookup(record);

				}else if (!record.tempSearchOptions.removePunctAndNumbers){

					record.tempSearchOptions.removePunctAndNumbers = true;
					this.lookup(record);

				}else if (!record.tempSearchOptions.removePunctAndNumbersAndSmallWords){

					record.tempSearchOptions.removePunctAndNumbersAndSmallWords = true;
					this.lookup(record);
				


				}else if (!record.tempSearchOptions.triedExact)	{

					//we tried the exact search, switch to fuzzy and try them all again

					record.tempSearchOptions = {};
					record.tempSearchOptions.triedExact = true;

					console.log("doing fuzzy");

					this.lookup(record);


				}else{

					//no matches oh well
					delete record['tempSearchOptions'];

					record.statusLookup[this.apiName] = "done";
					record.type[this.apiName] = "none";
					record.results[this.apiName] = false;


					app.dataStore.recordAdd(record.dbid, record,function(){ console.log("did it") });



				}

			}else{


				//we can process the results

				var allResultRecords = [];



				if (data.records){




					for (var x in data.records){


						if (data.records[x]['record']){


							for (aRecord in data.records[x]['record']){

								var aResultRecord = {

									names: [],
									titles: [],
									ids: {},
									viafId: false,
									nameType: false,
									levenshtein: 999,
									strOccurrence: 0,
									enrichment: null




								};


								var r = data.records[x]['record'][aRecord];

								if (r.recordData){
							
									if (r.recordData){

										if (r.recordData[0]){


											for (var recordKey in r.recordData[0]){

												if (recordKey.search('VIAFCluster') > -1){

													var cluster = r.recordData[0][recordKey];

													if (cluster[0]){

														cluster = cluster[0];
														//console.log(cluster)
														//console.log("^^^^")


														for (var key in cluster){


															//the main heading ns#:mainHeadings

															if (key.search(':mainHeadings') > -1){

																for (var z in cluster[key]){

																	var heading = cluster[key][z];

																	for (var headingKey in heading){

																		if (headingKey.search(':data') > -1){

																			var dataObj = heading[headingKey];

																			for (var y in dataObj){

																				var aDataObj = dataObj[y];

																				var nameObj = { name : false , sources : false};

																				for (var dataObjKey in aDataObj){


																					if (dataObjKey.search(':text') > -1){


																						if (aDataObj[dataObjKey][0]){
																							nameObj.name = aDataObj[dataObjKey][0];
																						}																						

																					}
																					if (dataObjKey.search(':sources') > -1){


																						if (aDataObj[dataObjKey][0]){
																							nameObj.sources = aDataObj[dataObjKey][0];
																						}	



																						for (var sourcesKey in nameObj.sources){

																							if(sourcesKey.search(':s') > -1){
																								nameObj.sources = nameObj.sources[sourcesKey];
																								break;
																							}
																						}



																					}

																					if (nameObj.name && nameObj.sources){

																						aResultRecord.names.push(nameObj);
																						nameObj = { name : false , sources : false};



																					}

																				}

																			}




																		}

																	}


																}

															}

															//the main heading ns#:mainHeadings
															if (key.search(':titles') > -1){


																for (var z in cluster[key]){

																	var titles = cluster[key][z];


																	for (var titlesKey in titles){


																		for (var y in titles[titlesKey]){

																			var aTitle = titles[titlesKey][y];


																			for (var aTitleKey in aTitle){


																				if (aTitleKey.search('text') > -1 || aTitleKey.search('title') > -1){

																					for (v in aTitle[aTitleKey]){

																						aResultRecord.titles.push(aTitle[aTitleKey][v]);
																					}

																				}


																			}

																		}

																	}


																}



															}


															if (key.search(':sources') > -1){


																for (var z in cluster[key]){

																	var aSource = cluster[key][z];

																	for (var q in aSource){

																		if (q.search(':source') > -1){

																			for (var y in aSource[q]){

																				var sourceObj = aSource[q][y];



																				if (sourceObj['_']){
																					var compound = sourceObj['_'];

																					var compoundSplit = compound.split('|');

																					if (compoundSplit.length ==2){

																						aResultRecord.ids[compoundSplit[0]] = compoundSplit[1];

																					}


																				}

																				


																			}

																		}


																	}


																}



															}




															//the viaf id ns#:viafID
															if (key.search(':viafID') > -1){
																for (var z in cluster[key]){
																	var viafId = cluster[key][z];
																	aResultRecord.viafId = viafId;
																}
															}

															//the viaf id ns#:nameType
															if (key.search(':nameType') > -1){
																for (var z in cluster[key]){
																	aResultRecord.nameType = cluster[key][z];
																}
															}


														}

													}												


												}

											}

										}




									}


								}




								allResultRecords.push(aResultRecord);

							}


						}


					}





				}


				allResultRecords = this.postLookup(record, allResultRecords);

				record.results[this.apiName] = allResultRecords;

				record.statusLookup[this.apiName] = "ready";

				app.dataStore.recordAdd(record.dbid, record,function(){ console.log("did it", allResultRecords.length) });

				
			}



		},


		/* do some post processing on the records returned */
		postLookup: function(record, allResultRecords){


			var lowestLevenshtein = 999
			var localTerm = app.utils.normalize(record.localTerm) 

		
			for (var x in allResultRecords){
				

				var defaultName = "";
				var sources = 1;
				var localStrOccurrence = 0;
				var highestStrOccurrence = 0

				//loop through all of the possible names and check to see if the levenshtein


				for (var nameKey in allResultRecords[x].names){


					var aName = allResultRecords[x].names[nameKey].name;
					var l = levenshtein.get(aName, record.localTerm);


					lowestLevenshtein = (l < lowestLevenshtein) ? l : lowestLevenshtein;
					

					//see if our name occurs within this name

					var aNameAry = aName.split(' ');

					for (var namePart in aNameAry){

						var nameBit = aNameAry[namePart];

						nameBit = app.utils.normalize(nameBit)

						if (nameBit != ""){

							console.log("lloking foir", nameBit, "(", aNameAry[namePart], ")", " in ",localTerm);


							if (localTerm.search(nameBit) > -1)
								localStrOccurrence++;

						}


					}

					highestStrOccurrence = (localStrOccurrence >= highestStrOccurrence) ? localStrOccurrence : highestStrOccurrence



				}


				allResultRecords[x].levenshtein = lowestLevenshtein
				allResultRecords[x].strOccurrence = highestStrOccurrence

				//also find the most use name and make that the default name
				for (var nameKey in allResultRecords[x].names){

					if (allResultRecords[x].names[nameKey].sources.length > sources){
						defaultName = allResultRecords[x].names[nameKey].name;
						sources = allResultRecords[x].names[nameKey].sources.length;
					}
				}

				if (defaultName==""){

					defaultName = allResultRecords[x].names[0].name;

				}


				allResultRecords[x].defaultName = defaultName;


			}


			return allResultRecords;


		},


		populateQueue: function(){

			var self = this;


			if (this.queue.length >= this.queueLimit)
				return false;

			app.dataStore.returnApiQueue(this.apiName, this.queueLimit - this.queue.length, function(data){

				var ids = []

				//we want to make sure it's not already in there
				for (var x in self.queue){
					ids.push(self.queue )
				}

				for (var x in data){

					var r = data[x];

					console.log("adding in ", r.localTerm);

					if (ids.indexOf(r.id) == -1){
						self.queue.push(r);
					}

				}

				//console.log(JSON.stringify(self.queue, null, 2));

				//console.log("~~~~~~");


			});



		}








	};




	app.apiViaf = apiViaf;

	app.apiViaf.init();



};