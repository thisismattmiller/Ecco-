(function() {

	"use strict";

	window.Ecco.Views.Project = Backbone.View.extend({



		events : {

			'click .load-button' : '',
			'submit .home-user-form' : 'formUserSubmit',
			'change .btn-file :file' : 'fileUploadButtonChange'



		},


		currentData : null,

		lastKey : null,


		initialize: function() {

			var self = this;

			Ecco.Events.on("stats:usersTotal", function(total){ $(".project-people").text(total);   });

			// Ecco.Events.on("stats:projectTotals", function(){ 
			// 	if (self.model['cid']){  
			// 		$(".project-total-left").text(self.model.get('totalTermsLeft'));  
			// 		$(".project-total-done").text(self.model.percentComplete() + "%");  


			// 	}  
			// });

			setInterval(function(){


					if (self.model.id){

						if (Ecco.collectionProjects.get(self.model.id)['attributes']['totalTermsLeft'] != 500){


							$(".project-total-left").text(Ecco.collectionProjects.get(self.model.id)['attributes']['totalTermsLeft']);  
							$(".project-total-done").text(Ecco.collectionProjects.get(self.model.id)['attributes']['totalDone']);  
						}
					}



			},2000)

			

		},

		fileUploadButtonChange: function(e){




			e.originalEvent.dataTransfer = { files:  e.currentTarget.files }



			Ecco.viewWindow.drop(e);

		},

		updateStats: function(){


			$(".project-people").text(Ecco.modelUser.get("totalUsers"));
			




		},

		render: function() {


			$(this.el).html("");

			var template = _.template(Ecco.Templates['project']);

			var html = template({model: this.model });

			$(this.el).html(html);


			Ecco.collectionProjects.fetch();
			Ecco.modelUser.update();

			this.model.requestWork();


			this.bindMenu();




		},

		noNewWork: function(checking){

			if (checking){
				$(this.el).html("<h2>Checking!</h2>");
			}else{
				$(this.el).html("<h5>No new work available! Leave the window open and some will come along eventually.</h5>");

			}
		},


		bindMenu: function(){

			var self = this;

			//some tool tips for the menu
			$('.project-shortcut-option').tooltip({placement: 'left'});	


			$('.project-shortcut-option').unbind('click').on('click',function(){

				$('.project-shortcut-option').removeClass('project-shortcut-active');
				$(this).addClass('project-shortcut-active');
				Ecco.modelUser.set('keyboardStyle',$(this).data('mode'));

				self.renderWork(self.currentData);


			});

		},

		renderWork: function(data){


			var template = _.template(Ecco.Templates['project-work']);

			var html = template({model: data });

			$(".project-work").html(html);

			this.currentData = data;

			this.bindWork();

			this.bindKeys();


		},

		bindKeys: function(){

			var self = this;

			self.lastKey = null;

			$(document).unbind('keydown').on('keydown',function(e){

				$(".project-work-card-small").each(function(i,element){
					if (e.which == parseInt($(element).data('keycode'))){
						self.doubleKeyCode= parseInt($(element).data('keycode'));
						$(element).click();
						e.preventDefault();
						return false;
					}
				});		

				if (e.which == 32 && self.lastKey == 32){

					self.sendResult('skip');
					self.lastKey = null;

				}


				self.lastKey = e.which;


			});

		},


		sendResult: function(id){

			this.model.sendResult(this.currentData,id);

		},

		bindWork: function(){

			var self = this;


			$(".icon-person,.icon-book,.icon-building").tooltip({placement: 'right'});	
			$(".icon-key").tooltip({placement: 'left'});	
			$(".project-work-card-large-element-btn-back, .project-work-card-large-element-btn-use").tooltip({placement: 'bottom'});	

			$(".project-work-local").find("span").tooltip({placement: 'right'});	

			$(".project-work-card-small").on("click touchstart", function(){


				if ($(this).data("useid")=='skip'){
					self.sendResult("skip");
					return false;
				}

				self.doubleKeyCode= parseInt($(this).data('keycode'));

				$(".project-work-card-small").css("opacity",0);

				//expand the card
				$(this)
					.css( {"opacity" : 1.0, "position" : "absolute", "z-index" : 5000, "background" : "whitesmoke", "height" : "100%", "width" : "100%"  } );


				//resize the image if its there
				$(this).find(".project-work-card-small-inside")
					.css( { "background-size" : "25%", "background-position" : "0 0", "text-align":"left"});

				//var old
				if ($(this).find(".project-work-card-small-inside").css("background-image").search('radial-gradient') > -1){
					
					//$(this).find(".project-work-card-small-inside").css( { "background" : "whitesmoke" });
					$(this).find(".project-work-card-large-element").css("left","1%");
					$(this).find(".project-work-card-small-inside").css('background-repeat', 'no-repeat');
					$(this).find(".project-work-card-small-inside").css('background-size', '100%');

				}

				//hide the small bits from the card
				$(this).find(".project-work-card-small-element").hide();

				//show the large bits
				$(this).find(".project-work-card-large-element").show();


				var selfEl = $(this);
				var backBtn = $(this).find(".project-work-card-large-element-btn-back").first();
				var useBtn = $(this).find(".project-work-card-large-element-btn-use").first();



				//the buttons
				$(this).find(".project-work-card-large-element-btn-use").first().unbind('click').click(function(){

					self.sendResult(selfEl.data("useid"));

				});

				



				$(this).find(".project-work-card-large-element-btn-back").first().unbind('click').click(function(){


					selfEl.find(".project-work-card-large-element").hide();


					selfEl.first()
						.css( { "background-size" : "", "background-position" : "50% 10%", "position" : "relative", "z-index" : 100, "background" : "transparent", "height" : "150px", "width" : ""  } );

					selfEl.find(".project-work-card-small-inside").first()
						.css( { "background-size" : "", "background-position" : "50% 10%", "text-align":"center"});



					selfEl.find(".project-work-card-small-element").show();



					$(".project-work-card-small").css("opacity",1);

					window.setTimeout(function(){

						self.bindWork();
						self.bindKeys();

					},100);


				});


				





				$(document).unbind('keydown').on('keydown',function(e){

					if (e.which == self.doubleKeyCode){
						

						useBtn.click();


					}else if (e.which == 32 || e.which == 27 || e.which == 96){

						backBtn.click();


						e.preventDefault();
						return false;

					}

				});


				selfEl.unbind('click')





			});



			/*

			$(".result-row").on("click touchstart", function(){

				$("#" + $(this).attr("id") + '-titles').toggle();
			})

			$(".result-row-select").on("click touchstart", function(){


				$(".project-work-auth, .project-work-local").fadeOut();

				self.currentData.use = $(this).data('id');

				self.model.sendResult(self.currentData);

			});

			$(".skip").on("click touchstart", function(){


				self.currentData.use = false;

				self.model.sendResult(self.currentData);

			});

			*/



		}





	});

}).call(this);