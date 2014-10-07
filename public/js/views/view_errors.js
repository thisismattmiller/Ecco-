(function() {

	"use strict";

	window.Ecco.Views.Errors = Backbone.View.extend({



		events : {

			'click .load-button' : ''

		},

		initialize: function() {

			var self = this;

			//socket
			Ecco.Events.on("socket:io_not_defined", function(){ self.showError("The Socket.io library is not loaded!",false); });
			Ecco.Events.on("socket:could_not_start_io", function(){ self.showError("The Socket.io could not be initialized, check client console.",false); });
			Ecco.Events.on("socket:disconnected", function(){ self.showError("Cannot talk to the server!",false); });
			Ecco.Events.on("socket:reconnected", function(){ self.showError("Reconnected!!",true); });

			//files
			Ecco.Events.on("file:missing_values", function(){ self.showError("Error reading that file.",false); });
			Ecco.Events.on("file:file_type_not_allowed", function(){ self.showError("Error that file type is not supported.",true); });
			Ecco.Events.on("file:read_error", function(){ self.showError("Error reading the file",false); });

			//parsing the file
			Ecco.Events.on("parse:parse_error", function(){ self.showError("Error parsing the file",false); });


			//interface errors
			Ecco.Events.on("interface:non_repeatable_sample_field", function(){ self.showError("You can only use that field once.",true); });

			Ecco.Events.on("interface:cataloger_name_too_short", function(){ self.showError("The cataloger name cannot be blank.",true); });
			Ecco.Events.on("interface:project_load_error", function(){ self.showError("Error loading that project.",true); });

			Ecco.Events.on("interface:no_user_no_project_selected", function(){ self.showError("You need to have entered a cataloger's name and selected a project before you can upload files.",true); });
			Ecco.Events.on("interface:ingest_need_both_id_term", function(){ self.showError("You need to set both the Local ID and the Local Term before we can ingest the file.",true); });



			//other events not having to do with errors
			//Ecco.Events.trigger("socket:available");


		},


		showError: function(e,fade){

			$(this.el).show();
			$(this.el).html(e);

			var el = $(this.el);

			if (fade){
				window.setTimeout(function(){el.fadeOut();},2000);
			}


		},



		clickLoadButton: function(e){


			console.log(e);

		},


		render: function() {


			$(this.el).html("");



		},



	});

}).call(this);