<div class="easeBM_pageContent">
	<!-- column 1 -->
	<div class="easeBM_column">
		<!-- type list -->
		<select multiple="multiple" id="easeBM_inspectorTypeSelect">
			<option selected="selected" value="all"><%=locale.inspector.all%></option>
			<option value="lang"><%=locale.inspector.lang%></option>
			<option value="header"><%=locale.inspector.header%></option>
			<option value="inlineStyle"><%=locale.inspector.inlineStyle%></option>
			<option value="list"><%=locale.inspector.list%></option>
			<option value="form"><%=locale.inspector.form%></option>
			<option value="table"><%=locale.inspector.table%></option>
			<option value="image"><%=locale.inspector.image%></option>
			<option value="link"><%=locale.inspector.link%></option>			
			<option value="role"><%=locale.inspector.role%></option>
			<option value="html5"><%=locale.inspector.html5%></option>
			<option value="frame"><%=locale.inspector.frame%></option>
		</select>		
	</div>

	<!-- column 2 -->
	<div class="easeBM_column">
		<!-- element list -->
		<select multiple="multiple" id="easeBM_inspectorElementSelect"></select>
	</div>

	<!-- column 3 -->
	<div class="easeBM_column">
		<div class="easeBM_toolbar">
			<!-- display HTML button -->
			<button aria-checked="true" role="checkbox" id="easeBM_inspectorDisplayButton" title="<%=locale.inspector.displayOnPageTitle%>" class="easeBM_OrangeButton"><%=locale.inspector.displayOnPage%></button>						
			<!-- export button -->
			<button id="easeBM_inspectorExportButton" class="easeBM_OrangeButton grey"><%=locale.inspector.exportButton%></button>
			<!-- back button -->
			<button id="easeBM_inspectorBackButton" class="easeBM_OrangeButton grey"><%=locale.inspector.backButton%></button>
		</div>
	</div>
</div>