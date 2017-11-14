<!DOCTYPE html>
<html>
	
	<head>
		<title><%= locale.alternative.title %></title>
		<link href="<%= config.root %>/tools/alternatives/style.css?<%= config.version %>" type="text/css" rel="stylesheet">
	</head>
	
	<body class="typeValid typeError typeEmpty">
		<div class="header hGrad">
			
			<!-- radio button : "All" -->
			<input type="radio" id="rAll" name="view" value="all" checked="checked">
			<label id="rAllLabel" tabindex="0" for="rAll"></label>

			<!-- radio button : "Error" -->
			<input type="radio" id="rError" name="view" value="error">
			<label id="rErrorLabel" tabindex="0" for="rError"></label>

			<!-- radio button : "Empty" -->
			<input type="radio" id="rEmpty" name="view" value="empty">
			<label id="rEmptyLabel" tabindex="0" for="rEmpty"></label>

			<!-- radio button : "Valid" -->
			<input type="radio" id="rValid" name="view" value="valid">
			<label id="rValidLabel" tabindex="0" for="rValid"></label>

			<span id="details"></span>
		</div>
	</body>

</html>