<div class="container <%= state %>">
	<div class="info"><%= element %></div>
	<div class="element">
		<span class="<%= state %>"><a href="javascript:"><%= label %></a></span>
		<br>
		<%= img %>
		<br><br>
	</div>
	<input type="button" value="<%= locale.alternative.infoButton %>" class="infoButton miniButton">
	<input type="button" value="<%= locale.alternative.findButton %>" class="findButton miniButton">	
</div>