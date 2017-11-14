requirejs.config({
	baseUrl: "../webapp"
});

define(["jquery", "gui/rateWidget/rateWidget"], function($, rate) {	
	$(".widget").easeBM_rateWidget();
});