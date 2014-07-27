(function() {

	"use strict";

	window.Ecco.Models.Config = Backbone.Model.extend({



		defaults: {



			//filetype router, based on the mime type send it to the right ingst model
			fileTypeRouter: {	},	//set in init



			/*File ingest configs*/
			
			//how many samples to display
			fileSampleSize : 15,

			//the def of the rows used on config and ingest
			fileColumnOptions : [

				 { name : 'localId',   repeatable : false,  display : 'Local Id',   hint : 'The identifyer from your local system, imporant keep in order to get the data back into the orginal system.', color: '#03a9f4' }
				,{ name : 'localTerm', repeatable : false,  display : 'Local Term', hint : 'The term from the local system which you want to disambiguate.', color: '#ffc107'}
				,{ name : 'localQual', repeatable : false,  display : 'Term Modifier', hint : 'When searching, this value will be used as well to find an authority match. This field could be life dates for example.', color: '#9c27b0'}
				,{ name : 'localHint', repeatable : true,  display : 'Local Hint', hint : 'A value from the local sytem that could help disambiguate the term, such as book title, or subject heading.', color: '#ff5722'}

			],






		},




		initialize: function(){

			var fileTypeRouter = {

				
					'text/csv' : Ecco.Models.FileCSV,

					'text/txt' : Ecco.Models.FileCSV

				}


			this.set('fileTypeRouter',fileTypeRouter);			

		}


	});

}).call(this);
