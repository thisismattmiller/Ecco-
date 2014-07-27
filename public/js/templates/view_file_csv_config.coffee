window.Ecco.Templates['fileCSVConfig'] = """


	<% for (x in model.get('sample')){ 

		var aSample = model.get('sample')[x];
		var aRow = aSample.results[0];
	%>


	<% } %>




	<div class="row fixed-full">

		<div class="box col-md-12 col-xs-18">
			
			<div class="box-header">					
					<h3 class="pull-left">Ingest -- Delimited File</h3>
					


					


					<div class="ingest-pallet">
						<div class="ingest-pallet-item ingest-pallet-item-title">Field Pallet:</div>


						<% _.each(Ecco.modelConfig.get('fileColumnOptions'), function(aPalletItem, aPalletItemIndex){ %>


							<div class="ingest-pallet-item"  data-toggle="tooltip" data-placement="top" data-display="<%=aPalletItem['display']%>" title="<%=aPalletItem['hint']%>">
								<div class="icon-arrow-down ingest-pallet-arrow" id="ingest-pallet-arrow-<%=aPalletItem['name']%>" draggable="true" data-repeatable="<%=aPalletItem['repeatable']%>" data-display="<%=aPalletItem['display']%>" data-color="<%=aPalletItem['color']%>" data-type="<%=aPalletItem['name']%>" style="color:<%=aPalletItem['color']%>"></div>
								<div class="ingest-pallet-item-label" ><%=aPalletItem['display'].replace(' ','<br>')%></div>
							</div>

						<%  }); %>


					</div>

			</div>

			<div class="box-body ingest-table-holder">


				<table class="ingest-sample-table">

					<thead>
						<tr>

							<% for (var x=0; x< model.get('numberColumns'); x++){ %>

								<th style="<%=100/model.get('numberColumns')%>%">

									<div class="ingest-sample-table-drop" data-column="<%=x%>">
										
										<div class="icon-arrow-down ingest-sample-table-arrow"></div>
										<span>Ignore</span>

										<div class="ingest-sample-table-drop-mask"></div>

									</div>

								</th>


							<%  } %>

						</tr>
					</thead>

					<% for (var x in model.get('sample')){ 

						var aSample = model.get('sample')[x];
						var aRow = aSample.results[0];

					%>

						<tr class="ingest-sample-table-row">

							<% var colCounter = 0; %>
							<% for (var aCol in aRow){ %>

								<td class="ingest-sample-table-row-column-<%=colCounter%>"><%=aRow[aCol]%></td>

								<% colCounter++ %>

							<% } %>

						</tr>




					<% } %>

				</table>


			</div>

			<div class="box-footer">	

						<input id="ingest-first-row" type="checkbox"><label for="ingest-first-row">First row is column labels</label>

						<button class="btn btn-sm pull-right btn-primary">Ingest</button>

						<button class="btn btn-sm pull-right">Cancel</button>
			</div>

		</div>

	</div>






"""