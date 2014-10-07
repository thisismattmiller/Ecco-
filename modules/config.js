

module.exports = function(app){



	config = {


		databasePath : './data/database/',


		//apiNames : ['viaf','freebase'],

		apiNames : ['viaf'],

		publicMode: true,

		publicConsensus: 3




	};





	app.config = config;



};