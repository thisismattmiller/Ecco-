(function() {

	"use strict";

	window.Ecco.Views.FileCSVConfig = Backbone.View.extend({

		initialize: function() {

			this.render();


		},

		rebind: function(){

			var self = this;

			$(".ingest-pallet-item").tooltip();

			$(".ingest-sample-table-drop").on("mouseenter",function(e){

				var col = $(this).data('column');
				$("td").removeClass('ingest-sample-table-column-highlight');
				$(".ingest-sample-table-row-column-" + col).addClass('ingest-sample-table-column-highlight');

			})
			.on("mouseleave",function(e){
				$("td").removeClass('ingest-sample-table-column-highlight');
			});


			//do the drag and drop stuff


			$(".ingest-pallet-item .icon-arrow-down").on("dragstart",function(e){

				self.dragStartElement = this;

				e.originalEvent.dataTransfer.effectAllowed = 'copy';
				e.originalEvent.dataTransfer.setData('Text', this.id);

				$(".ingest-sample-table-arrow").removeClass("animation-wiggle-target").addClass('animation-wiggle-target');
				

			});





			$(".ingest-sample-table-drop-mask").on("dragenter",function(e){

				//if (e.preventDefault) e.preventDefault(); // allows us to drop

				if (!$($(this).parent().children()[0]).hasClass('icon-arrow-down-selected')){




					$(this).parent().css("color",$(self.dragStartElement).css('color'));			
					$($(this).parent().children()[1]).text( $(self.dragStartElement).data('display') );

					var col = $(this).parent().data('column');
					$("td").removeClass('ingest-sample-table-column-highlight');
					$(".ingest-sample-table-row-column-" + col).addClass('ingest-sample-table-column-highlight');




				} 
				





			});

			$(".ingest-sample-table-drop-mask").on("dragleave",function(e){



				if (!$($(this).parent().children()[0]).hasClass('icon-arrow-down-selected')){

					//if (e.preventDefault) e.preventDefault(); // allows us to drop
					$(this).parent().css("color",'inherit');
					$($(this).parent().children()[1]).text( "Skip" );

				}



			});



			$(".ingest-sample-table-drop-mask").on("drop",function(e){

				if (e.preventDefault) e.preventDefault(); // allows us to drop

				var column = $(this).parent().data('column');

				if (self.columnConfigAdd(column)){


					$(this).parent().css("color",$(self.dragStartElement).css('color'));			
					$($(this).parent().children()[1]).text( $(self.dragStartElement).data('display') );

					//remove the mask
					$($(this).parent().children()[2]).hide();


					$(this).parent().append($("<span>").addClass('icon-close').addClass('ingest-sample-table-remove').click(function(e){self.columnConfigRemove(e);}));
					$($(this).parent().children()[0]).addClass('icon-arrow-down-selected');
					$($(this).parent().children()[1]).addClass('ingest-pallet-item-label-selected');

					$(this).parent().addClass("ingest-sample-table-droped");

					//mark it as used
					if (!$(self.dragStartElement).data('repeatable')){
						$("#ingest-pallet-arrow-"+ $(self.dragStartElement).data('type')).addClass('ingest-pallet-arrow-used');

					}




				}else{
					$(this).parent().css("color",'inherit');
					$($(this).parent().children()[1]).text( "Skip" );				
				}
				

			});



			$("#ingest-first-row").change(function(){

				self.toggleFirstRow($(this).prop( "checked" ));

			});


			$(".ingest-cancel").click(function(){
				Ecco.viewProject.render();
			})

			$(".ingest-ingest").click(function(){
				
				if (self.model.validateConfig()){
					self.model.ingest();				
				}
			})




		},

		toggleFirstRow: function(firstRow){
			this.model.set("firstRowIsHeaders",firstRow);

			if (firstRow){
				$($("tr")[1]).addClass('fist-row-disabled')
			}else{
				$($("tr")[1]).removeClass('fist-row-disabled')
			}

		},

		columnConfigAdd: function(column){


			//can we add this one
			return this.model.addConfig(

				{
					field : $(this.dragStartElement).data('type'),
					column : column
				}


			);

		},



		columnConfigRemove: function(e){

			var el = $(e.target);

			var col = el.parent().data('column');


			//before deleting it get the id and make sure the interface is updated
			var id = this.model.get("columnLayout")[col];

			if ( this.model.removeConfig(col) ){

					el.parent().css("color",'inherit');
					$(el.parent().children()[1]).text( "Skip" )

					$(el.parent().children()[2]).show();
					
					$(el.parent().children()[0]).removeClass('icon-arrow-down-selected');
					$(el.parent().children()[1]).removeClass('ingest-pallet-item-label-selected');

					el.parent().removeClass("ingest-sample-table-droped");

					el.parent().find(".ingest-sample-table-remove").remove();

					$("#ingest-pallet-arrow-" + id).removeClass('ingest-pallet-arrow-used');

			}


		},


		render: function() {

			var fileCSVConfigTemplate = _.template(Ecco.Templates['fileCSVConfig']);


			var html = fileCSVConfigTemplate({model: this.model, columnOptions: Ecco.modelConfig.get('fileColumnOptions')});

			$(this.el).html(html);


			this.rebind();


 		},



	});

}).call(this);