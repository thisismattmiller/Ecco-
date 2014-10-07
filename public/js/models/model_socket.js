(function() {

	"use strict";

	window.Ecco.Models.Socket = Backbone.Model.extend({


		defaults: {

			connected: false,
			previouslyConnected: false,
			socket: null


		},



		initialize: function(){


			this.checkConnectionSetup();

		},

		


		//pings the socket object to see if we are still connected and or just reconnected
		checkConnectionSetup: function(){

			var self = this;

			window.setInterval( function socketConnectedCheck(){

				if (self.socket.connected == false){
					Ecco.Events.trigger("socket:disconnected");
					self.set('connected',false);
					self.set('previouslyConnected',false);
				}else{

					self.set('connected',true);

					if (self.get('previouslyConnected') == false){
						self.set('previouslyConnected',true);
						Ecco.Events.trigger("socket:reconnected");
					};
				}

			}, 10000);

		},



		connect: function(){

			if (window.io){

				try{
					this.socket = io();
					this.set('connected',true);
					this.set('previouslyConnected',true);
					this.socket.user = null;


					Ecco.Events.trigger("socket:available");


					return true;
			

				}catch(e){
					console.error("The Socket.io could not be initialized, check client console.");
					console.error("-----------------------------------");
					console.error(e);
					console.error("-----------------------------------")

					this.set('connected',false);
					this.set('previouslyConnected',false);

					Ecco.Events.trigger("socket:could_not_start_io");

					return false;
				}
			

			}else{
				Ecco.Events.trigger("socket:io_not_defined");
				return false;
			}
			



		}


	});

}).call(this);
