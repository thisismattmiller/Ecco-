(function() {

	"use strict";

	window.Ecco.Views.Errors = Backbone.View.extend({



		events : {

			'click .load-button' : ''

		},

		initialize: function() {

			var self = this;

			//socket
			Ecco.Events.on("socket:io_not_defined", function(){ self.showError("The Socket.io library is not loaded!"); });
			Ecco.Events.on("socket:could_not_start_io", function(){ self.showError("The Socket.io could not be initialized, check client console."); });
			Ecco.Events.on("socket:disconnected", function(){ self.showError("Cannot talk to the server!"); });
			Ecco.Events.on("socket:reconnected", function(){ self.showError("Reconnected!!"); });

			//files
			Ecco.Events.on("file:missing_values", function(){ self.showError("Error reading that file."); });
			Ecco.Events.on("file:file_type_not_allowed", function(){ self.showError("Error that file type is not supported."); });
			Ecco.Events.on("file:read_error", function(){ self.showError("Error reading the file"); });

			//parsing the file
			Ecco.Events.on("parse:parse_error", function(){ self.showError("Error parsing the file"); });


			//interface errors
			Ecco.Events.on("interface:non_repeatable_sample_field", function(){ self.showError("You can only use that field once."); });

		},


		showError: function(e){


			$(this.el).html(e);


		},



		clickLoadButton: function(e){


			console.log(e);

		},


		render: function() {


			$(this.el).html("");



		},



	});

}).call(this);