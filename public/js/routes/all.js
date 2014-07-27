(function() {

	"use strict";
	

	window.Ecco.Routers.Routes = Backbone.Router.extend({

		routes: {
			".*": "standard",
			"load" : "load",
			"ingestLayout" : "ingestLayout"
		}

	});

	window.Ecco.Routers.init = function(){


		// //define routes
		// Analyzer.allRoutes = new window.Analyzer.Routers.Routes();


		// //Loads the basic standard layout
		// Analyzer.allRoutes.on('route:standard', function(){
		// 	//we want the nav bar
		// 	Analyzer.viewNavbar.render();

		// 	Analyzer.workspace = "home";

		// 	$("#main").html(''); 


		// });

		// //Loads load into the main
		// Analyzer.allRoutes.on('route:load', function(){
		// 	Analyzer.workspace = "load";

		// 	//we want the nav bar
		// 	Analyzer.viewNavbar.render();

		// 	Analyzer.viewLoad.render();
		// });

		// Analyzer.allRoutes.on('route:ingestLayout', function(){
		// 	Analyzer.workspace = "ingestLayout";

		// 	//we want the nav bar
		// 	Analyzer.viewNavbar.render();
		// 	Analyzer.viewIngestLayout.startLayoutFlow();
		// });


		// Backbone.history.start();




	};

}).call(this);