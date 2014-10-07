(function() {

	"use strict";
	
	window.Ecco = {



		Models : {},
		Views : {},
		Routers: {},
		Collections: {},
		Templates: {},

		Events: _.extend({}, Backbone.Events),

		workspace : "home",

		init : function(){


			$.ajaxSetup({
			    timeout: 5000,
			    cache: false 
			});


			//models
			this.modelConfig = new this.Models.Config();
			this.modelSocket = new this.Models.Socket();
			this.modelUser = new this.Models.User();


			//collections
			this.collectionProjects = new this.Collections.Projects();



			//views
			this.viewError = new this.Views.Errors({model: {}, el: $("#errors")});
			this.viewWindow = new this.Views.Window({model: {}, el: $(document)});
			this.viewHomeUser = new this.Views.HomeUser({model: this.modelUser, el: $("#main")});
			this.viewHomeProjects = new this.Views.HomeProjects({model: this.collectionProjects, el: $("#main")});
			

			//redefined later on when project is selected
			this.viewProject = new this.Views.Project({model: {}, el: $("#main")});


			//start the routes
			this.Routers.init();



			//connect to the server
			this.modelSocket.connect();











		}




	};



	$(document).ready(function(){


		console.log("HI!");
		return window.Ecco.init();

	});



}).call(this);