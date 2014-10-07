(function() {

	"use strict";

	window.Ecco.Views.Window = Backbone.View.extend({



		initialize: function() {


			//handle drag and drop for ingesting new file

			if (EccoConfig.publicMode){


			}else{
				$(this.el).on("dragenter", this.dragenter);
				$(this.el).on("dragover", this.dragover);
				$(this.el).on("drop", this.drop);
			}

		},


		dragenter: function(e) {
			e.stopPropagation();
			e.preventDefault();
		},

		dragover: function(e) {
			e.stopPropagation();
			e.preventDefault();
		},


		drop: function(e) {
			e.stopPropagation();
			e.preventDefault();

			if (!Ecco.modelUser.get("name") || !Ecco.collectionProjects.activeProject()){
				Ecco.Events.trigger("interface:no_user_no_project_selected");
				return false;
			}


			var dt = e.originalEvent.dataTransfer;
			var file = dt.files[0];


			if (file){
				var fileRouter = Ecco.modelConfig.get('fileTypeRouter');

				if (fileRouter[file.type]){

					Ecco.modelFileCSV = new fileRouter[file.type](file);

				}else{
					Ecco.Events.trigger("file:file_type_not_allowed");
				}
			}



		}




	});

}).call(this);