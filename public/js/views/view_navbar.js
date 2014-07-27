// (function() {

// 	"use strict";

// 	window.Analyzer.Views.navbar = Backbone.View.extend({



// 		events : {

// 			'click .load-button' : 'clickLoadButton'

// 		},

// 		initialize: function() {


// 		},



// 		clickLoadButton: function(e){


// 			console.log(e);

// 		},


// 		render: function() {


// 			var navbarTemplate = _.template(Analyzer.Templates['navbar']);


// 			var html = navbarTemplate({model: this.model.attributes});

// 			$(this.el).html(html);



// 		},



// 	});

// }).call(this);