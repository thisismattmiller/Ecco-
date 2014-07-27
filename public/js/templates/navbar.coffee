window.Ecco.Templates['navbar'] = """

	

	<div class="navbar navbar-inverse navbar-fixed-top">

		<a href="#load" <%=(!model.enableFileButton) ? 'disabled="disabled"' : ''%> class="btn green load-button"><i class="icon-truck"></i><span>LOAD</span></a>


	</div>



"""