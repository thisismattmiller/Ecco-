// (function() {

// 	"use strict";

// 	window.Analyzer.Views.ingestLayout = Backbone.View.extend({



// 		events : {

			

// 		},

// 		initialize: function() {

// 			var self = this;

// 			self.model = {};

// 			self.activeHash = null;
// 			self.totalPages = null;


// 		},


// 		renderPage: function(data){



// 			var ingestLayoutTemplate = _.template(Analyzer.Templates['ingestLayoutPage']);
// 			var html = ingestLayoutTemplate({model: data});

// 			$("#ingest-layout-body-page").html(html);

// 			console.log(data.thisLayout.elements);


// 		},




// 		startLayoutFlow: function(hash){

// 			var self = this;

// 			if (typeof hash == 'undefined'){
// 				hash='47d7f8d4f7893567714cf1649e6800d9b5dbbe6a';
// 			}



// 			//make sure we have the workspace setup
// 			this.render();


// 			//TODO Remove this timeout its only for development
// 			setTimeout(function(){



// 				//get the data for the first page of this hash
// 				Analyzer.collectionFiles.get(hash).getPageLayout(0, function(data){
			    	
			    		
// 			    	self.renderPage(data);




// 			    } );



// 			},200)




// 		},

// 		render: function() {

// 			Analyzer.workspace = "ingestLayout";

// 			var self = this;

// 			var ingestLayoutTemplate = _.template(Analyzer.Templates['ingestLayout']);
// 			var html = ingestLayoutTemplate({model: self.model});

// 			$(self.el).html(html);


// 			$("#main").fadeIn();

// 		},


// 		bindMenus: function(type){


// 			var self = this;


// 			//right click menus for the ingest items

// 			if (type==='ingest'){

// 			    $.contextMenu({
// 			        selector: '.load-body-item-ingest', 
// 			        callback: function(key, options) {

// 			        	if (key == 'delete'){
// 			        		self.ingestDelete($(this).data('hash'));
// 			        	}
// 			        	if (key == 'ingest'){
// 			        		self.ingestIngest($(this).data('hash'));
// 			        	}


// 			        },
// 			        items: {
// 			            "ingest": {name: "Ingest", icon: "ingest"},
// 			            "delete": {name: "Delete", icon: "delete"},

// 			        }
// 			    });
			    


// 			}


// 		}



// 	});

// }).call(this);