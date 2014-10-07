
(function() {

	"use strict";

	window.Ecco.Collections.Projects = Backbone.Collection.extend({

		model: window.Ecco.Models.Project,



		initialize: function(){

			var self = this;
			
			

			
			//we have to wait for the socket to come online before getting the data and binding our emmit events to it
			Ecco.Events.on("socket:available", function(){ self.fetch(); self.bindSocket() });


		},

		bindSocket: function(){

			var self = this;

			this.socket = Ecco.modelSocket.socket;


			//when the project list comes in update our list
			this.socket.on('projectsList', function(msg){

				var activeId = "";

				self.each(function(p,i){

					if (p.get("active")){
						activeId = p.get("id");
					}

				});

				//update the collection
			    self.reset(msg.result);

				self.each(function(p,i){

					if (p.get("id") == activeId){
						p.set("active",true);
					}

				});


			    //if we are on the projects page 
			    if ($(".home-projects").length > 0){
			    	Ecco.viewHomeProjects.render();
			    }

			    Ecco.Events.trigger("stats:projectTotals");



			});		

			//the server is singling an update
			this.socket.on('projectsUpdate', function(msg){

				self.fetch();
			});	



			this.socket.on('projectsSendRecordResponse', function(msg){


				var record = msg.result;

				if (record.dbid == self.activeProject()){
					
					record=self.orderWorkRecords(record);
					Ecco.viewProject.renderWork(record);
				}

				//empty response, nothing was sent
				if (!record.dbid){

					Ecco.viewProject.noNewWork();

					window.setTimeout(function(){

						Ecco.viewProject.noNewWork(true);
						Ecco.viewProject.model.requestWork();

					},5000);

				}

									
				




			});



		},


		fetch: function(){
			Ecco.modelSocket.socket.emit("projectsList")
		},



		//utility func for func below
		objSort: function() {
		    var args = arguments,
		        array = args[0],
		        case_sensitive, keys_length, key, desc, a, b, i;

		    if (typeof arguments[arguments.length - 1] === 'boolean') {
		        case_sensitive = arguments[arguments.length - 1];
		        keys_length = arguments.length - 1;
		    } else {
		        case_sensitive = false;
		        keys_length = arguments.length;
		    }

		    return array.sort(function (obj1, obj2) {
		        for (i = 1; i < keys_length; i++) {
		            key = args[i];
		            if (typeof key !== 'string') {
		                desc = key[1];
		                key = key[0];
		                a = obj1[args[i][0]];
		                b = obj2[args[i][0]];
		            } else {
		                desc = false;
		                a = obj1[args[i]];
		                b = obj2[args[i]];
		            }

		            if (case_sensitive === false && typeof a === 'string') {
		                a = a.toLowerCase();
		                b = b.toLowerCase();
		            }

		            if (! desc) {
		                if (a < b) return -1;
		                if (a > b) return 1;
		            } else {
		                if (a > b) return -1;
		                if (a < b) return 1;
		            }
		        }
		        return 0;
		    });
		}, 



		//takes a work record and orders it into an array based on the attributes
		//this is to put he more likely candidates at the front of the render queue
		orderWorkRecords: function(record){

			for (var api in record.results){

				record.results[api + "Ordered"] = [];

				for (var aRecord in record.results[api]){

					record.results[api + "Ordered"].push(record.results[api][aRecord])

				}
			

				record.results[api + "Ordered"] = this.objSort(record.results[api + "Ordered"],  ['strOccurrence', true], 'levenshtein');

			}

			return record


		},


		activateProject: function(id){

			if (!id){
				return false;
			}


			this.each(function(p,i){

				p.set("active",false);

				if (p.get("id") == id){
					p.set("active",true);
				}



			});

			return false;

		},

		activeProject: function(){

			var activeProject = false;

			this.each(function(p,i){
				if (p.get("active")){
					activeProject = p.get('id');
				}
			});


			return activeProject;


		},



		addNewProject: function(name){

			this.socket = Ecco.modelSocket.socket;

			this.socket.emit('projectsCreate', {name:name});



		}

	});


}).call(this);

