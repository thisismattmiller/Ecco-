window.Ecco.Templates['homeProjects'] = """

	

		<div class="home-projects">

			<h2>Projects:</h2>

			<div class="container-fluid">

			<div class="row">

			<% model.each(function(e,i){ %>


  				<div class="col-md-3 home-project-item" >
  						
  					<a href="#" class="home-project-item-content box" data-id="<%=e.get('id')%>" style="background-color:<%=e.get('color')%>">
  						
  						<div class="home-project-item-title"><%=e.get('name')%></div>


  						<div class="home-project-item-count"><span class="badge" style="color:<%=e.get('color')%>"><%=e.get('totalTerms')%></span> Total Terms</div> 
  						<div class="home-project-item-count"><span class="badge" style="color:<%=e.get('color')%>"><%=e.get('totalTermsLeft')%></span> Total Left</div> 
  						<div class="home-project-item-count"><span class="badge" style="color:<%=e.get('color')%>"><%=e.get('totalDone')%></span> Terms Done</div> 
  						<div class="home-project-item-count"><span class="badge" style="color:<%=e.get('color')%>"><%=e.get('totalTermsApied')%></span> Terms Ready to Work</div> 



						<div class="progress">
						  <div class="progress-bar progress-bar-info" role="progressbar" aria-valuenow="20" aria-valuemin="0" aria-valuemax="100" style="width:<%=e.percentComplete()%>%">

						  </div>
						</div>


  					</a>

  				</div>




			<% }); %>


			</div>
			<% if (EccoConfig.publicMode){ %>

				

			<% }else{ %>

				<form class="form-inline home-project-form" role="form">
				 	<input class="form-control input-lg home-project-new-name" type="text" placeholder="Project Nick Name"> 
				  	<button type="submit" class="btn btn-lg btn-primary">Create New</button>

				</form>

			<% } %>



		</div>


"""
