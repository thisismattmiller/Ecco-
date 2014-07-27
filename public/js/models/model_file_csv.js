
(function() {

	"use strict";



	window.Ecco.Models.FileCSV = Backbone.Model.extend({

		defaults: {

			name: false,
			type: false,
			size: false,
			file: false,


			sampleSize: null, //Inherits from config model on init

			sample: [],

			allowedTypes: ['text/csv', 'text/txt'],

			//stores the layout of the columns
			columnLayout : {},

			
			firstRowIsHeaders: false,



		},

		initialize: function(f){

			var self = this;


			//get the defualt values

			this.set('sampleSize', Ecco.modelConfig.get("fileSampleSize"));





			if (!f.name || !f.size || !f.type){
				Ecco.Events.trigger("file:missing_values");
				return false;
			}else{
				this.set("name", f.name);
				this.set("size", f.size);
				this.set("type", f.type);
				this.set("file", f);
			}


			//make sure we can use it
			if (this.get("allowedTypes").indexOf(f.type) == -1){
				Ecco.Events.trigger("file:file_type_not_allowed");
				return false;
			}



			//get a random sampling of the data before we ingest it into the server
			var preconfig ={

				config: {
						header: false,
						step: function(data, file){
							return self.takeSample(data);
						}
					}
			}

			//get the sample, will trigger sampleReady when done.
			try{
				$.parseFile(f, preconfig, $.proxy(self.sampleReady, self), function(){ window.Ecco.Events.trigger("parse:parse_error") } );
			}catch(e){
				console.error("Error parsing the file");
				console.error("-----------------------------------");
				console.error(e);
				console.error("-----------------------------------")
				Ecco.Events.trigger("parse:parse_error");
				return false;
			}

		},


		//	The parser will stream data here, take a randomish 
		//	sample until we have the required amount
		//
		takeSample: function(data){

			var currentSample = this.get('sample');
			if (currentSample.length < this.get("sampleSize") ){
				//randomish chance or if it is the first row
				if ( Math.floor(Math.random()*2) == 1 || (currentSample.length == 0)){
					currentSample.push(data);
					this.set("sample",currentSample);
				}
				return true;
			}else{
				//we are done, stop the papa parser
				return false;
			}
		},

		//	Called by the parser when we have enough samples to show
		sampleReady: function(){

			var self = this;


			self.analyzeSample();

			Ecco.viewFileCSVConfig = new Ecco.Views.FileCSVConfig({model: this, el: $("#main")});


		},

		//	Get some metrics about the sample take, for example the number of cols
		analyzeSample: function(){

			var maxLength = 0;

			for (var x in this.get('sample')){ 

				var aSample = this.get('sample')[x];
				var aRow = aSample.results[0];

				maxLength = (aRow.length >= maxLength) ? aRow.length : maxLength;

			}

			this.set('numberColumns', maxLength)


		},



		addConfig: function(map){


			var repeatable =  null;

			var layout = this.get('columnLayout');

			//is the requested field def repeatable
			_.each(Ecco.modelConfig.get("fileColumnOptions"), function(x,i){
				if (x.name === map.field){
					repeatable = x.repeatable;
				}
			});

			//how many times have we used it
			var totalUsed = 0;
			_.each(layout, function(x,i){
				if (x === map.field){
					totalUsed++;
				}
			});

			//is the requested spot taken already?
			if ( typeof layout[map.column] !== 'undefined' ){
				return false;
			}

			//no repeatables
			if (repeatable === false && totalUsed > 0){
				return false;
			}


			//add it
			layout[map.column] = map.field;
			this.set(layout);

			return true;


		},


		removeConfig: function(column){


			var layout = this.get('columnLayout');
			if (layout[column]){
				delete layout[column];
				this.set('columnLayout',layout);
				return true;
			}else{
				return false;
			}

			


		}


// 	idAttribute: "hash",


// 	defaults: {

// 		hash: null,
// 		lastUpdate: null,
// 		created: null,
// 		lastEditor: null,
// 		title: null,
// 		fileType: null,
// 		dataModel : null,
// 		published: null,
// 		process: null,
// 		filename: null,
// 		ingested: null



// 	},



// 	//kick off the apis to ingest this file
// 	ingest: function(callback){


// 		var self = this;

// 		$.get(
// 		"/api/ingest/init",
// 		{ 
// 			hash: self.id
// 		}
// 		).done(function(data){

// 			if (data){

// 				//kick off the extract elements



// 				$.get(
// 				"/api/ingest/extract",
// 				{ 
// 					hash: self.id
// 				}
// 				).done(function(data){

// 					if (data){

// 						//kick off status update
// 						var notice = Analyzer.viewWindow.notifyPercent();

// 						var noticeTimer = window.setInterval(function(){


// 							$.get(
// 							"/api/status",
// 							{ 
// 								hash: self.id
// 							}
// 							).done(function(data){

// 		    					var options = {
// 		    						title: data.task,
// 		    						text: data.progressText
// 		    					}


// 		    					if (data.progressPercent == 100){
// 		    						window.clearInterval(noticeTimer);
// 					                options.title = "Done!";
// 					                options.type = "success";
// 					                options.hide = true;
// 					                options.closer = true;
// 					                options.sticker = true;
// 					                options.icon = 'icon-okay';
// 					                options.opacity = 1;
// 					                options.shadow = true;
// 					                options.width = $.pnotify.defaults.width;


// 					                //we are done with the layout extraction next step
// 					                Analyzer.viewIngestLayout.startLayoutFlow(self.id);
// 		    					}
// 		    					if (data.progressPercent === false){
// 		    						window.clearInterval(noticeTimer);
// 					                options.title = "Error!";
// 					                options.type = "error";
// 					                options.text = "There was an error in the python script. Please look at the server console for more information."
// 					                options.hide = true;
// 					                options.closer = true;
// 					                options.sticker = true;
// 					                options.icon = 'icon-skull';
// 					                options.opacity = 1;
// 					                options.shadow = true;
// 					                options.width = $.pnotify.defaults.width;

// 					                //kick it back to the load screen
// 					                Analyzer.viewLoad.render();
					                

// 		    					}
// 		    					notice.pnotify(options);


// 							});


// 						},100);


						
// 					}else{

// 						Analyzer.viewWindow.notify("Ingest Error","There was a error in starting the extraction script.","error");
// 						Analyzer.viewLoad.render();

// 					}


// 					//callback();			

// 				}).fail(function(){
// 					alert("There was an error communicating with the server.")

// 				});





// 			}else{

// 				Analyzer.viewWindow.notify("Ingest Error","There was a filesystem error while trying to create data directories.","error");
// 				Analyzer.viewLoad.render();

// 			}



// 			callback();			

// 		}).fail(function(){
// 			alert("There was an error communicating with the server.")

// 		});




// 	},


// 	getPageLayout: function(page, callback){

// 		var self = this;

// 		$.get(
// 		"/api/ingest/getPage",
// 		{ 
// 			hash: self.id,
// 			page: page
// 		}
// 		).done(function(data){



// 			callback(data);		



// 		}).fail(function(){
// 			alert("There was an error communicating with the server.")

// 		});


// 	},


// 	delete: function(callback){

// 		var self = this;

// 		$.get(
// 		"/api/files/remove",
// 		{ 
// 			hash: self.id
// 		}
// 		).done(function(data){



// 			callback();		



// 		}).fail(function(){
// 			alert("There was an error communicating with the server.")

// 		});


// 	}


	});

}).call(this);

