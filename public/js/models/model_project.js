(function() {

	"use strict";

	window.Ecco.Models.Project = Backbone.Model.extend({



		defaults: {

			name: null,
			id : null,
			totalTerms: 0,
			totalTermsLeft : 0,
			totalTermsLeftToApi : 0,
			totalTermsApied : 0,
			active: false,
			color: '#259b24'
			
		},

		socketBound : false,

		percentComplete: function(){

			if (this.get('totalTerms') == 0){
				return 0;
			}else{
				return (this.get('totalDone') ) / this.get('totalTerms') * 100;
			}

		},

		initialize: function(){


		},


		sendResult: function(data,id){


			//FIX for multi API

			if (data.use){
				data.use.push({"type":"viaf","id":id});
			}else{
				data.use = [{"type":"viaf","id":id}];
			}

			data.lastTouched = Ecco.modelUser.get("name");

			console.log("Sending",data);

			Ecco.modelSocket.socket.emit("projectsResult", data);


			this.requestWork();
		},

		requestWork: function(){

			console.log("requesting work");
			Ecco.modelSocket.socket.emit("projectsSendRecord", {"dbid": Ecco.collectionProjects.activeProject(), "user":Ecco.modelUser.get("name")});


		}


	});

}).call(this);
