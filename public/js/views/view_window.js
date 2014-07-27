(function() {

	"use strict";

	window.Ecco.Views.Window = Backbone.View.extend({



		initialize: function() {


			//handle drag and drop for ingesting new file

			$(this.el).on("dragenter", this.dragenter);
			$(this.el).on("dragover", this.dragover);
			$(this.el).on("drop", this.drop);

		},


		dragenter: function(e) {
			e.stopPropagation();
			e.preventDefault();
		},

		dragover: function(e) {
			e.stopPropagation();
			e.preventDefault();
		},


		drop: function(e) {
			e.stopPropagation();
			e.preventDefault();


			var dt = e.originalEvent.dataTransfer;
			var file = dt.files[0];

			if (file){
				var fileRouter = Ecco.modelConfig.get('fileTypeRouter');

				if (fileRouter[file.type]){
					Ecco.modelFileCSV = new fileRouter[file.type](file);
				}else{
					Ecco.Events.trigger("file:file_type_not_allowed");
				}
			}



		}
// 		fileUploadDom : null,



// 		events : {


// 		},




// 		initialize: function() {

// 			//this is the fileupload 
// 			this.fileUploadDom = $('<input id="fileupload" type="file" name="files" multiple="multiple">');

// 			$(this.fileUploadDom).fileupload({
// 				url: Analyzer.modelConfig.get('uploadUrl'),
// 				dataType: 'json',

// 				done: function (e, data) {
					
// 					if (data.result.sucess){

// 						$.pnotify({
// 							title: 'File Uploaded',
// 							text: data.result.filename + ' uploaded!',
// 							type: 'success'
// 						});

						
// 						Analyzer.Events.trigger("upload:success");

// 					}else{

// 						$.pnotify({
// 							title: 'File Error',
// 							text: data.result.filename + ' Error! ' + data.result.msg + ' : ' + data.result.error  ,
// 							type: 'error'
// 						});

// 						Analyzer.Events.trigger("upload:error");


// 					}

// 					//refresh the files collection
// 					Analyzer.collectionFiles.fetch();


// 				},
// 				fail: function (e, data) {
// 						$.pnotify({
// 							title: 'Error response from server',
// 							text: ''  ,
// 							type: 'error'
// 						});

// 						Analyzer.Events.trigger("upload:fail");


// 				}
// 			});

// 		},


// 		notify: function(title,text,type){

// 			$.pnotify({
// 				title: title,
// 				text: text,
// 				type: type
// 			});

// 		},


// 		notifyPercent: function(){


// 		    var notice = $.pnotify({
// 		        title: "Please Wait",
// 		        type: 'info',
// 		        icon: 'ui-pnotify-spinner',
// 		        hide: false,
// 		        closer: false,
// 		        sticker: false,
// 		        shadow: false
// 		    });

// 		    // setTimeout(function() {
// 		    //     notice.pnotify({
// 		    //         title: false
// 		    //     });
// 		    //     var interval = setInterval(function() {
// 		    //         percent += 2;
// 		    //         var options = {
// 		    //             text: percent + "% complete."
// 		    //         };
// 		    //         if (percent == 80) options.title = "Almost There";
// 		    //         if (percent >= 100) {
// 		    //             window.clearInterval(interval);
// 		                // options.title = "Done!";
// 		                // options.type = "success";
// 		                // options.hide = true;
// 		                // options.closer = true;
// 		                // options.sticker = true;
// 		                // options.icon = 'picon picon-task-complete';
// 		                // options.opacity = 1;
// 		                // options.shadow = true;
// 		                // options.width = $.pnotify.defaults.width;
// 		    //             //options.min_height = "300px";
// 		    //         }
// 		    //         notice.pnotify(options);
// 		    //     }, 120);
// 		    // }, 2000);

// 			return notice;

// 		},


// 		render: function() {



// 		},



	});

}).call(this);