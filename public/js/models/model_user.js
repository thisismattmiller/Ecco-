(function() {

	"use strict";

	window.Ecco.Models.User = Backbone.Model.extend({



		defaults: {

			name: false,


			totalUsers: 0,

			keyboardStyle : "alpha"





		},




		initialize: function(){

			var self = this;
			//we have to wait for the socket to come online before getting the data and binding our emmit events to it
			Ecco.Events.on("socket:available", function(){ self.bindSocket() });	

			this.on("change:totalUsers", function(){ Ecco.Events.trigger("stats:usersTotal", self.get("totalUsers"), self); }, this);


		},


		bindSocket: function(){

			var self = this;

			//the server is singling an update
			Ecco.modelSocket.socket.on('usersRollCall', function(msg){	
				
				if (self.get("name") != false)
					Ecco.modelSocket.socket.emit("usersPresent", self.get("name"));
			});	

			Ecco.modelSocket.socket.on('usersRollCallResults', function(msg){
				self.set("totalUsers",msg);
			});	



		},

		update: function(){
				if (this.get("name") != false)
					Ecco.modelSocket.socket.emit("usersPresent", this.get("name"));



		}


	});

}).call(this);
