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


			//collections
			//this.collectionFiles = new this.Collections.Files();




			//views
			this.viewError = new this.Views.Errors({model: {}, el: $("#errors")});
			this.viewWindow = new this.Views.Window({model: {}, el: $(document)});



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