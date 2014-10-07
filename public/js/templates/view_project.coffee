window.Ecco.Templates['project'] = """

	





	<div class="project">

		<div class="project-status">
			<span class="project-people"></span><span class="icon-people"></span> | 
			<span>Terms Left:</span><span class="project-total-left"></span> | 
			<span>Done:</span><span class="project-total-done"></span>
			<div class="project-shortcut">
				<span>Keyboard Mode:</span>
				<span data-mode="alpha" title="Use the keys: A,S,D,F and Z,X,C,V for quick select." class="icon-alpha project-shortcut-option project-shortcut-active"></span>
				<span> | </span>
				<span data-mode="numeric" title="Use the number pad for quick select."  class="icon-numeric project-shortcut-option"></span>
			</div>


		</div>


		<% if (model.get("totalTerms") == 0){ %>

			<div class="project-no-terms">
				
				<div>
					
					<span class="icon-file-happy project-no-terms-icon"></span>

				</div>



				<div>No terms yet, drag and drop a file on to the page. <span class="btn btn-default btn-xs btn-file"><input type="file">(or click here)</span><br><br>I can process:<br><% _.each(Ecco.modelConfig.get("fileTypeRouter"),function(e,i){%><%=i%><br><%});%></div>



			</div>



		<% }else{ %>


			<div class="project-work">



			</div>


		<% } %>


	</div>



"""


window.Ecco.Templates['project-work'] = """


	<%


		var mapAlpha = {

			"0" : "A",
			"1" : "S",
			"2" : "D",
			"3" : "F",
			"4" : "Z",
			"5" : "X",
			"6" : "C",
			"7" : "V"
		}

		var mapAlphaCode = {
			"0" : 65,
			"1" : 83,
			"2" : 68,
			"3" : 70,
			"4" : 90,
			"5" : 88,
			"6" : 67,
			"7" : 86	
		}

		var mapNumeric = {

			"0" : "7",
			"1" : "8",
			"2" : "9",
			"3" : "4",
			"4" : "5",
			"5" : "6",
			"6" : "1",
			"7" : "2",
			"8" : "3"
		}

		var mapNumericCode = {
			"0" : 103,
			"1" : 104,
			"2" : 105,
			"3" : 100,
			"4" : 101,
			"5" : 102,
			"6" : 97,
			"7" : 98,	
			"8" : 99,
		}


		if (Ecco.modelUser.get("keyboardStyle") == 'alpha'){
			var map = mapAlpha;
			var mapCode = mapAlphaCode;
			var rowStyle = 'col-xs-6 col-sm-3';
		}else{
			var map = mapNumeric;
			var mapCode = mapNumericCode;
			var rowStyle = 'col-xs-6 col-sm-4';
		}


	%>
	
	<div class="project-work-local">

		<h2><span title="This is the local term, find the authorized authorized version below."><%=model.localTerm%></span></h2>



		<% _.each(model.localHint, function(e,i){ %>


			<span title="This the context, where this term was found. A hint to help find the right name."><%=e%></span><br>


		<% }) %>


	</div>
	<div class="project-work-auth">

		<div class="row" style="margin:0">

			<% _.each(model.results['viafOrdered'], function(e,i){ %>

				<%

					var enrichWikiImage = "";
					var enrichWikiImageSpan = "";
					if (e.enrichment){
						if (e.enrichment['wiki']){
							if (e.enrichment['wiki']['image']){
								if (e.enrichment['wiki']['image'] != ''){
									enrichWikiImage = "background-image: url(" + e.enrichment['wiki']['image'] + "); background-position: center 10%; background-repeat: no-repeat;"
									enrichWikiImageSpan = "background-color: rgba(0,0,0,0.5);color: white;"
								}
							}
						}
					}


					var useId = "";
					if (e.viafId){
						useId = e.viafId;
					}




				%>

				<% if (e.nameType.search('UniformTitle') == -1){ %>
				
					<div class="<%=rowStyle%> project-work-card-small" data-useId="<%=useId%>" data-keycode="<%=mapCode[i]%>" id="#project-work-card-<%=i%>">


						<div class="box project-work-card-small-inside<%if (e.strOccurrence>0){%> project-work-card-small-inside-good<%}%>" data-useId="<%=useId%>" style="<%=enrichWikiImage%>">
							
							<span class="project-work-card-small-element" style="<%=enrichWikiImageSpan%>"><%=e.defaultName%></span>

							<% if (e.nameType == "Personal"){ %>
								<div title="Personal Name Term" class="icon-person project-work-card-small-type project-work-card-small-element"></div>
							<% } %>

							<% if (e.nameType.search('UniformTitle') > -1){ %>
								<div title="Name Title Term" class="icon-book project-work-card-small-type project-work-card-small-element"></div>
							<% } %>

							<% if (e.nameType == "Corporate"){ %>
								<div title="Corporate Name Term" class="icon-building project-work-card-small-type project-work-card-small-element"></div>
							<% } %>

							<% if (Ecco.modelUser.get("keyboardStyle") == 'alpha' && i < 8){%>
								<div title="Shortcut: [<%=map[i]%>] key" class="icon-key project-work-card-small-key project-work-card-small-element">
									<div><%=map[i]%></div>
								</div>
							<% } %>

							<% if (Ecco.modelUser.get("keyboardStyle") == 'numeric' && i < 9){%>
								<div title="Shortcut: [<%=map[i]%>] key" class="icon-key project-work-card-small-key project-work-card-small-element">
									<div><%=map[i]%></div>
								</div>
							<% } %>

							<div class="project-work-card-large-element">

								<div>
								<% _.each(e.names, function(name,nameIndex){ %>


									<span><%=name.name%></span><%=(nameIndex == e.names.length -1) ? "" : " |"%>


								<% }); %>
									<% if (e.viafId){ %>
										<span>[<a target="_blank" href="http://viaf.org/viaf/<%=e.viafId%>"><%=e.nameType%></a>]</span>
									<% }else{ %>
										<span>[<%=e.nameType%>]</span>
									<% } %>
								</div>
								<div class="project-work-card-large-element-titles">
									<div class="titles-title">Titles:</div>
									<% _.each(e.titles, function(title,titleIndex){ %>


										<div><%=title%></div>


									<% }); %>								
								</div>


								<% if (e.enrichment) {

									if  (e.enrichment['wiki']) {

										if  (e.enrichment['wiki']['http://dbpedia.org/property/shortDescription']) {

											if  (e.enrichment['wiki']['http://dbpedia.org/property/shortDescription'] != '') { %>

												<div>Description: <%=e.enrichment['wiki']['http://dbpedia.org/property/shortDescription']%></div>
								<%
											}
										}
									}
								}


								%>
								<% if (e.enrichment) {

									if  (e.enrichment['wiki']) {

										if  (e.enrichment['wiki']['http://purl.org/dc/terms/subject']) { %>

											<div>
												<% _.each(e.enrichment['wiki']['http://purl.org/dc/terms/subject'], function(enrich,enrichIndex){ %>



													<span class="label label-default"><%=enrich.split('Category:')[1].replace(/_/g,' ')%></span>


												<% }); %>								
											</div>

								<%
										}
									}

								}

								%>


								<button title="This is the right term, use it. Shortcut: The same key you used to open." class="btn btn-primary btn-lg project-work-card-large-element-btn-use"><span class="icon-check"></span>&nbsp;&nbsp;Use Term [<%=map[i]%> key]</button>
								<button title="Go back to all the terms. Shortcut: [esc], [space] or [0] num pad key." class="btn btn-default btn-lg project-work-card-large-element-btn-back"><span class="icon-cancel"></span>&nbsp;&nbsp;Back [space key]</button>


							</div>


						</div>

					

					</div>

				<% } %>

			<% }) %>

			<div class="<%=rowStyle%> project-work-card-small" data-useId="skip" id="#project-work-card-skip">

				<div class="box project-work-card-small-inside" data-useId="skip">

					<div class="icon-cancel project-work-card-small-skip"></div>

					<div class="project-work-card-small-element project-work-card-small-skip-label">No Match / Skip</div>
				
					<div class="project-work-card-small-skip-label project-work-card-small-skip-shortcut">Press [space bar] twice to skip.</div>

				</div>


			</div>





		</div>





	</div>


"""


