var request 	= require('request');
var requestNoEncoding = require('request').defaults({ encoding: null });

module.exports = function(app){



	enrichWiki = {



		intervalLimit : 500,		//ms to wait between api calls

		queueLimit : 100,			//how many things do we hold in memory 

		connectionActive : false,

		enrichName: 'wiki',

		url : 'http://dbpedia.org/data/{ID}.json',

		queue: [],



		init: function(){

			var self = this;

			console.log("Yeahhhh")

			setInterval(function(){

				self.populateQueue();

			},5000);






		    setInterval(function(){


		    	if (self.connectionActive){
		    		return;
		    	}





				for (var x in self.queue){
					


					var data = self.queue[x]


					if (data.results){

						for (var aApi in data.results){

							if (data.results[aApi]){

								var pruneIt = true;

								for (var aName in data.results[aApi]){


									//if not enriched at all or this enrichment type is not done
									if (!data.results[aApi][aName]['enrichment']){
										pruneIt=false;
									}else if (!data.results[aApi][aName]['enrichment'][self.enrichName]){
										pruneIt=false;
									}

								}

							}



						}


					}

					if (pruneIt){


						console.log("PURNINIGNR IT!")

						var record = self.queue[x];					
						
						app.dataStore.recordAdd(record.dbid, record,function(){ console.log("did it", record.localTerm) });


						self.queue.splice(x, 1);

						console.log(self.queue.length);

						break

					}else{

						self.lookup(x);
						break

					}


				}


			},self.intervalLimit);






		
		},


		lookup: function(recordIndex){


			var self = this;


			if (self.connectionActive)
				return false;

			if (self.queue[recordIndex].results){

				for (var aApi in self.queue[recordIndex].results){

					if (self.queue[recordIndex].results[aApi]){


						//is there even a wikipedia id to use for this name?
						for (var aName in self.queue[recordIndex].results[aApi]){

							//hack
							if (!self.queue[recordIndex].results[aApi][aName]['ids']){
								self.queue[recordIndex].results[aApi][aName]['ids']={};
							}

							if (self.queue[recordIndex].results[aApi][aName]['ids']['WKP']){

								var process = false;

								if (!self.queue[recordIndex].results[aApi][aName]['enrichment']){
									process = true;
								}
								if (self.queue[recordIndex].results[aApi][aName]['enrichment']){
									if (!self.queue[recordIndex].results[aApi][aName]['enrichment']['wiki']){
										process = true;
									}
								}


								// console.log("Do:",self.queue[recordIndex].results[aApi][aName]['ids']['WKP'])
								// console.log(process,aApi,aName,recordIndex);


								if (process){

									//console.log(JSON.stringify(self.queue[recordIndex].results[aApi][aName], null,"\t"));


									if (self.connectionActive)
										return false;


									self.connectionActive = true;

									self.processWiki(self.queue[recordIndex].results[aApi][aName]['ids']['WKP'], recordIndex, aApi, aName, function(data, index, api, name){

										 // console.log("Updating aApi", api)
										 // console.log("Updating aName", name)
										 // console.log("Updating recordIndex", index)

										if (!self.queue[index].results[api][name]){
											self.queue[index].results[api][name] = {};
										}

										self.queue[index].results[api][name]['enrichment'] = data;

										//ask the work queue to prune this out incase it is sitting in the queue, it is outdataed
										app.projects.pruneWorkQueue(self.queue[index].dbid,self.queue[index].id )


										self.connectionActive = false;



									})
								}


							}else{


								// console.log("NO WKP")

								//set the enrichment as blank and update the self.queue[recordIndex]
								self.queue[recordIndex].results[aApi][aName]['enrichment'] = {};
								self.queue[recordIndex].results[aApi][aName]['enrichment']['wiki'] = "No Wiki Id";



							}							



						}

					}



				}


			}


	


		},





		processWiki: function(id, recordIndex, aApi, aName, callback){

			result = {

				'wiki' : 'Error talking to dbpedia'

			}

			var self = this;

			var url = this.url.replace('{ID}',id)

			var thisUri = 'http://dbpedia.org/resource/' + id


			setTimeout(function(){


				request(url, function (error, response, body) {



					//things went okay
					if (!error && response.statusCode < 400) {

						var bodyJson = false;

						try {
							bodyJson = JSON.parse(body);
						} catch (e) {
							// An error has occured, handle it, by e.g. logging it
							console.log(e);
						}

						if (bodyJson){


							for (var uri in bodyJson){

								

								if (thisUri.toLowerCase() == uri.toLowerCase()){


									result = {

										'wiki' : {

											'http://dbpedia.org/property/shortDescription' : '',

											'http://purl.org/dc/terms/subject' : [],

											'http://dbpedia.org/ontology/thumbnail' : '',

											'image' : ''


										}

									}

									for (var predicate in bodyJson[uri]){

										

										if (predicate == 'http://dbpedia.org/property/shortDescription'){

											for (var x in bodyJson[uri][predicate]){
												if (bodyJson[uri][predicate][x]['value']){
													result['wiki']['http://dbpedia.org/property/shortDescription'] = bodyJson[uri][predicate][x]['value']
												}
											}									
										}
										if (predicate == 'http://purl.org/dc/terms/subject'){
											
											for (var x in bodyJson[uri][predicate]){
												if (bodyJson[uri][predicate][x]['value']){
													result['wiki']['http://purl.org/dc/terms/subject'].push(bodyJson[uri][predicate][x]['value'])
												}
											}


										}
										if (predicate == 'http://dbpedia.org/ontology/thumbnail'){
											
											for (var x in bodyJson[uri][predicate]){
												if (bodyJson[uri][predicate][x]['value']){
													result['wiki']['http://dbpedia.org/ontology/thumbnail'] = bodyJson[uri][predicate][x]['value']
												}
											}


										}


									}


								}






							}



						}

					}else{


						console.error("Error talking to dbpedia");
						console.log(error);
						console.log(body);
						if (response)
							console.log(response.statusCode );

						self.intervalLimit = self.intervalLimit + 100;


	

					}



					if (result['wiki']['http://dbpedia.org/ontology/thumbnail']){

						if (result['wiki']['http://dbpedia.org/ontology/thumbnail'] != ''){

							console.log("----------OMG!!!!-----------")



							
							requestNoEncoding.get(result['wiki']['http://dbpedia.org/ontology/thumbnail'], function (error, response, body) {
								if (!error && response.statusCode == 200) {
									data = "data:" + response.headers["content-type"] + ";base64," + new Buffer(body).toString('base64');
									result['wiki']['image'] = data									
								}
								callback(result, recordIndex, aApi, aName)
							});


						}else{
							callback(result, recordIndex, aApi, aName)
						}
					}else{
						callback(result, recordIndex, aApi, aName)
					}


					


				});

			}, this.intervalLimit);






		},


		populateQueue: function(){

			var self = this;


			if (this.queue.length >= (this.queueLimit))
				return false;



			app.dataStore.returnEnrichQueue(this.enrichName, this.queueLimit - this.queue.length, function(data){

				var ids = []

				//we want to make sure it's not already in there
				for (var x in self.queue){
					ids.push(self.queue )
				}

				for (var x in data){

					var r = data[x];

					console.log("adding in ", r.localTerm,self.queue.length);

					if (ids.indexOf(r.id) == -1){
						self.queue.push(r);
					}

				}


			});



		}








	};




	app.enrichWiki = enrichWiki;

	app.enrichWiki.init();



};