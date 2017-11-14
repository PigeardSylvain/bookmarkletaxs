/* rate widget jquery plugin */

define(["jquery", "tpl!menu/rateWidget/rateWidget.tpl"], function($, tpl) {		
	({		
		// Plugin init
		"init": function() {		
			var me = this;

			// Add plugin to jsquery scope
			$.fn.easeBM_rateWidget = function(options, arg) {
				var element = this;

				// If the first argument is a string, this is not options but the name of a method to call
				if (options && typeof(options) == "string") {
					// Call the right method					
					window.setTimeout(function() {
						me[options].apply(element, [arg]);
					},0);

					return true;
				}

				// Load template
				this.html(tpl());
				this.addClass("easeBM_rateWidget");

			 	return this;
			}	
		}

		// Update
		,"update": function(rate) {								
			// Set rate between 0 and 100%	
			rate = (rate<0)?0:((rate>100)?100:rate);
			
			// If the rate has not changed => exit
			if (this.data().value && this.data().value == rate) {
				return true;
			}

			// Save value in data attribute
			this.data("value", rate);

			var textEl = this.find(".easeBM_rateWidget_rate");
			this.find("div div div").animate({"height": rate+"%"}, {
				duration: 400,
				step: function(height){
					textEl.html(Math.round(height)+"%");
				}
			});			
		}
	}).init();	// Call init
});