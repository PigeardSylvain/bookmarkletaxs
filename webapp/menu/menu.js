/* menu */

define(["i18n!nls/locale", "jquery", "tools/autoAudit/autoAudit", "tools/alternatives/alternatives", "tools/inspector/inspector", "tools/screenReaderViewTool/screenReaderViewTool", "menu/rateWidget/rateWidget"], function(locale, $, autoAuditTool, altTool, inspector, screenReaderViewTool, rateWidget) {	
	return {
		"fontSize": 100		// default font-size: 100%

		// Init bookmarklet
		,"init": function() {

			var me = this;

			$.fn.easeBM_menu = function(options) {

				var header = $(this).children().first();
			 	var pageContainer = $(this).children().next();

			 	// Add styles
			 	$(this).addClass("easeBM_mainMenu").attr("style", "display: none");
			 	$(this).find("div").first().addClass("easeBM_menuHeader");
			 	var items = header.find("li").each(function(index, item) {
			 		$(item).html("<a href='#' class='noSelect'>"+$(item).text()+"</a>");
			 	});
			 	pageContainer.addClass("easeBM_pageContainer");
			 	pageContainer.children().addClass("easeBM_pageList").hide().children().addClass("easeBM_page");

				// For each item
			 	$.each(header.find("a"), function(index, item) {
					$(pageContainer.children()[index]).children().hide().first().show();
					// Add click event
			 		$(item).click(function() {
			 			header.find("li.selected").removeClass("selected");
			 			$(this).parent().addClass("selected");
			 			$(".easeBM_pageContainer").children().hide();
			 			$($(".easeBM_pageContainer").children()[index]).fadeIn();			 						 			

			 			// Update scrollbars
			 			$(".easeBM_scrollbar").each(function(i, el) {
			 				$(el).tinyscrollbar_update();
			 			});
			 		});
			 	});

			 	// Select a menu item by default
			 	header.find("li a")[0].click();

			 	// Init tool page
			 	me.initToolPage();

			 	// Init settings page
			 	me.initSettingsPage();

			 	return this;
			}
		
			// Init jquery plugins
			this.initPlugins();			
		}

		// Init tools page
		,"initToolPage": function() {			
			// Init alternative tool page
			this.initAltPage();

			// Init inspector page
			this.initInspectorPage();

			// Init screen reader view tool
			this.initScreenReaderView();

			// Init auto audit tool
			this.initAutoAudit();

			// Init jquery enabler link
			this.initJqueryEnabler();

			// Init confort enabler link
			this.initConfortEnabler();			
		}

		// Init settings page
		,"initSettingsPage": function() {
			var me = this;

			// Decrease font button click
			$("#easeBM_setDownBtn").click(function() {				
				me.fontSize -= 5;
				me.fontSize = (me.fontSize<0)?0:me.fontSize;
				$(".easeBM_mainMenu").attr("style", "font-size: "+me.fontSize+"% !important");				
				$("#easeBM_settingsSection span").html(locale.menu.settings.fontSize+" ("+me.fontSize+"%)");
				me.updateScrollbar();
			});

			// Increase font button click
			$("#easeBM_setUpBtn").click(function() {
				me.fontSize += 5;				
				$(".easeBM_mainMenu").attr("style", "font-size: "+me.fontSize+"% !important");
				$("#easeBM_settingsSection span").html(locale.menu.settings.fontSize+" ("+me.fontSize+"%)");
				me.updateScrollbar();				
			});
		}

		// Update bookmarklet scrollbars
		,"updateScrollbar": function() {
			$(".easeBM_scrollbar").each(function(i, el){
				$(el).tinyscrollbar_update();
			});
		}

		// Init inspector page
		,"initInspectorPage": function() {
			// Inspector link (other click)
			$("#easeBM_inspectorLink").click(function() {
				// Display tool page
				inspector.display();				
			});
		}

		// Init alternative page
		,"initAltPage": function() {
			altTool.initPageMenu();
		}

		// Init screen reader view tool
		,"initScreenReaderView": function() {
			// Screen reader view tool link
			$("#easeBM_screenReaderView").click(function() {
				// Start screen reader view tool
				screenReaderViewTool.start();
			});
		}

		// Init auto audit tool
		,"initAutoAudit": function() {			
			$("#easeBM_auditStartButton").click(function() {
				autoAuditTool.start();
			});			
		}		

		// Init jquery enabler link
		,"initJqueryEnabler": function() {
			var me = this;

			$("#easeBM_jqueryEnabler").click(function() {

				if (me.jQueryEnabled) {
					// disable jquery
					window.$ = me.$backup;
					me.jQueryEnabled = false;
					$(this).text(locale.menu.tools.enableJquery);
					$(this).attr("title", locale.menu.tools.enableJqueryTip);
				} else {
					// enable jquery
					me.$backup = window.$;
					window.$ = window.easeBookmarklet.jquery;
					me.jQueryEnabled = true;
					$(this).text(locale.menu.tools.disableJquery);
					$(this).attr("title", locale.menu.tools.disableJqueryTip);
				}
			});
		}

		// Init confort enabler link
		,"initConfortEnabler": function() {
			var me = this;

			$("#easeBM_confortEnabler").click(function() {
				if (!me.confortEnabled) {
					me.confortEnabled = true;
					$(this).text(locale.menu.tools.enabledConfort);
					$(this).attr("title", locale.menu.tools.enabledConfortTip);

					// enable confort					
					var e = document.createElement('script');
					e.setAttribute('language', 'javascript');
					e.setAttribute('id', 'easeBM_confort');
					e.setAttribute('src', 'http://comfort.orange.com/serveur/crossdom/js/toolbar.js');
					document.body.appendChild(e);
					setTimeout('accessibilitytoolbar.init()', 100);
					window.easeBookmarklet.toggleDisplay();
				}
			});	
		}

		// Init plugins
		,initPlugins: function() {

			// Remove class by prefix
			$.fn.removeClassByPrefix = function (prefix) {
				this.each(function(i, el) {
					var regx = new RegExp('\\b' + prefix + '.*?\\b', 'g');
    				el.className = el.className.replace(regx, '');
    			});
    			return this;
			};		

			// Truncate string
			$.fn.truncateString = function (str, length) {
				if (str.length<length) {
					return str;
				}
				
				return str.substr(0, length)+"...";
			}
		}
	}
});