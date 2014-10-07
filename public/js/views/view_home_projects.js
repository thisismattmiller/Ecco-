(function() {

	"use strict";

	window.Ecco.Views.HomeProjects = Backbone.View.extend({



		events : {

			'click .home-project-item-content' : 'projectSelect',
			'touchstart .home-project-item-content' : 'projectSelect',
			'submit .home-project-form' : 'formProjectSubmit',



		},

		initialize: function() {

			var self = this;


		},



		formProjectSubmit: function(e){

			var name = $(".home-project-new-name").first().val();

			if (name.length > 0){

				this.model.addNewProject(name);

			}else{

				Ecco.Events.trigger("interface:project_name_too_short");

			}


			e.preventDefault();
			return false;

		},

		projectSelect: function(e){


			var id = $(e.currentTarget).data('id');


			if (id){

				this.model.activateProject(id);

				//init the project view and display
				Ecco.viewProject = new Ecco.Views.Project({model: this.model.get(id), el: $("#main")});
				Ecco.viewProject.render();

			}else{

				Ecco.Events.trigger("interface:project_load_error");

			}


			e.preventDefault();
			return false;


		},


		render: function() {


			$(this.el).html("");


			var template = _.template(Ecco.Templates['homeProjects']);

			var html = template({model: this.model });

			$(this.el).html(html);


		},



	});

}).call(this);