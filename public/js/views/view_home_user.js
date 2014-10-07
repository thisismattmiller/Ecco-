(function() {

	"use strict";

	window.Ecco.Views.HomeUser = Backbone.View.extend({



		events : {

			'click .load-button' : '',
			'submit .home-user-form' : 'formUserSubmit'

		},

		initialize: function() {

			var self = this;

			this.render();

			if (!this.model.get('name')){
				$(".home-user-name").first().focus();
			}else{
				$(".home-user-name").hide();
			}




		},



		formUserSubmit: function(e){



			var name = $(".home-user-name").first().val();

			if (name.length > 0){

				this.model.set("name",name);

				
				$(".home-user, .home-logo").fadeOut(
					function(){
						Ecco.viewHomeProjects.render();
					}
				);


			}else{

				Ecco.Events.trigger("interface:cataloger_name_too_short");

			}


			e.preventDefault();
			return false;

		},


		render: function() {


			$(this.el).html("");

			var template = _.template(Ecco.Templates['homeUser']);

			var html = template({model: this.model });

			$(this.el).html(html);


		},



	});

}).call(this);