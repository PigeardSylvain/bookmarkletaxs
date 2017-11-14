/* 	easebookMarklet module */

define(["i18n!nls/locale", "jquery", "menu/menu", "tpl!menu/menu.tpl", "config", "vendor/jquery.tinyscrollbar"], function(locale, $, menu, menuTpl, config, tinyScrollbarPlugin) {	
	return {
		
		"focusedElement": null

  		// Start bookmarklet
  		,start: function() {
	        
	        var me = this;

	        // Global bookmarklet object
	        window.easeBookmarklet = {
	        	jquery: $
	        	,isDisplay: false

	        	// Toggle boorkmarklet display
				,toggleDisplay: function() {	     	     	
		     		if (me.isDisplay) {		     			
		     			me.focusedElement = document.activeElement;
		     			window.setTimeout(function() {
		     				$("body").removeClass("easeBM_displayed");
		     			}, 400);
		     			$(".easeBM_mainMenu").fadeOut(400);
		     			me.isDisplay = false;		     			
		     		} else {
		     			$(".easeBM_mainMenu").removeClass("easeBM_transparent");
		     			window.scroll(0,0);		
		     			window.setTimeout(function() {
		     				$(".easeBM_mainMenu").fadeIn(400);
		     			}, 400);		     			
		     			$("body").addClass("easeBM_displayed");		     			
		     			me.isDisplay = true;

		     			// Restore focus or focus selected menu item
		     			window.setTimeout(function() {
		     				if (me.focusedElement) {
		     					me.focusedElement.focus();
		     				} else {
		     					$(".easeBM_mainMenu li.selected a").focus();	
		     				}
		     			}, 500);
		     			
		     		}
				}
	        }

			// Load CSS
			this.addStyleFile(require.toUrl("style.css"));

			// Init menu jquery plugin
			menu.init();

	        // Create main menu
	        this.createMainGUI();

	        // Display bookmarklet
	        window.easeBookmarklet.toggleDisplay();

	        // Init keyboard shortcuts
	        this.initShortcuts();
	        
      	}

      	// Add style file
      	,addStyleFile: function(url) {
      		
      		url = url.split("?");
      		url = url[0] + "?"+config.version;

			if (document.createStyleSheet) {				
			    document.createStyleSheet(url);		// for IE
			}
			else {
			    $('<link rel="stylesheet" type="text/css" href="' + url + '" />').appendTo('head');  	// for other browsers
			}
      	}   
      	   	
      	// Create main menu
      	,createMainGUI: function() { 
      		// Create menu
      		var menuEl = $("<div>").append(menuTpl({
      			"fontSize": menu.fontSize
      			,"locale": locale
      			,"config": config
      		}));

      		// Insert menu html content
      		$("body").prepend(menuEl);

      		// Execute jquery plugin
      		menuEl.easeBM_menu();      		
      	}

      	// Init keyboard shortcuts
      	,"initShortcuts": function() {      	
	        $("body").keydown(function(e) {	        		        	
	        	switch(e.keyCode) {
	        		// "²" key event
		        	case 0: 
		        	case 222: 
		        		// Show/Hide menu
						$(".easeBM_mainMenu").toggleClass("easeBM_transparent");
						break;
					// + key
		        	case 107:
		        		// Increase font size
		        		$("#easeBM_setUpBtn").click();
						break;
		        	// - key
		        	case 109:
		        		// Decrease font size
		        		$("#easeBM_setDownBtn").click();
		        		break;
		        }
	        		        	
	        })

      	}

	}
});
