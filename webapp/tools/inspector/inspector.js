/* inspector tool */
define(["jquery", "i18n!nls/locale", "tpl!tools/inspector/main.tpl", "tpl!tools/inspector/export.tpl", "common/tools", "config"], function($, locale, mainTpl, exportTpl, tools, config) {	
	return {
		"elementList": null
		,"isDisplayed": true
		,"exportWindow": null
		,"stringMaxLength": 100			// Truncate large string
		,isInit: false

		// Init header tag tool page
		,"init": function() {
			var me = this;

			// Get main template
			var tpl = mainTpl({"locale": locale});

			// Insert template
			$("#easeBM_inspector").html(tpl);

			// Init backbutton event
			$("#easeBM_inspectorBackButton").click(function() {me.hide();});
			$("#easeBM_inspector .easeBM_pageContent").keydown(function(e) {
				if (e.keyCode == 27) { 		// escape key code
					me.hide();
				}
			});

			// Init display button
			$("#easeBM_inspectorDisplayButton").click(function() {
				$(this).toggleClass("grey");
				if (me.isDisplayed) {
					me.hideHTML();
					me.isDisplayed = false;
					$(this).attr("aria-checked", "false");
				} else {					
					// Add selected type class
					$("#easeBM_inspectorTypeSelect option:selected").each(function(i, el) {					
						$("body").addClass("easeBM_inspector_"+$(el).attr("value"));
					});	
					$(this).attr("aria-checked", "true");
					me.isDisplayed = true;
				}
			});

			// Init export button
			$("#easeBM_inspectorExportButton").click(function() {
				me.export();
			});

			// Init list events
			this.initListsEvent();			

			// Init Ok
			this.isInit = true;
			
		}

		// Display inspector tool page
		,"display": function(selectedElement) {

			// Init first
			if (!this.isInit) {
				this.init();
			}

			$("#easeBM_toolsSection>div").hide();		// Hide other tool pages
			$("#easeBM_inspector").fadeIn();			// Display inspector tool page
			$("#easeBM_inspectorTypeSelect").focus();

			// Select default value
			this.selectElementType(null, selectedElement);
		}

		// Hide inspector tool page
		,"hide": function() {				
			$("#easeBM_toolsSection>div").hide();		// Hide other tool pages
			$("#easeBM_toolsHome").fadeIn();
			$("#easeBM_inspectorLink").focus();			// Restore focus

			// Remove all inspector classes
			$("body").removeClass("easeBM_inspector");
			$("body").removeClassByPrefix("easeBM_inspector_");	
			$(".easeBM_highlight").removeClass("easeBM_highlight");			
		}

		// Fill elements list
		,"fillElementList": function(type) {

			// Reset list
			$("#easeBM_inspectorElementSelect").html("");

			// Call the right method for the selected type
			if (this["fillElementList_"+type]) {
				this["fillElementList_"+type]();
			}
		}

		// Display header elements
		,"fillElementList_header": function() {
			var me = this;

			// Fill list with headers
			this.elementList = $("h1, h2, h3, h4, h5, h6").filter(":not(.easeBM_mainMenu *)").each(function(i, el) {
				// Create spaces before label (h1 no space, h2 one space, h3 two spaces ...)
				var level = $(this).prop("tagName").substr(1);				
				var spaces = Array(parseInt(level)).join("...");				
				var tag = $(el).prop("tagName")+" ";
				$("#easeBM_inspectorElementSelect").append("<option>"+$().truncateString(spaces+tag+$(el).text(), me.stringMaxLength)+"</option>");
			});
		}

		// Display list elements
		,"fillElementList_list": function() {
			var me = this;

			// Fill list with headers
			this.elementList = $("ul, ol").filter(":not(.easeBM_mainMenu *)").each(function(i, el) {
				$("#easeBM_inspectorElementSelect").append("<option>"+$().truncateString($(el).text(), me.stringMaxLength)+"</option>");
			});
		}

		// Display form elements
		,"fillElementList_form": function() {
			var type, label;
			var me = this;

			// Fill list with headers
			this.elementList = $("input[type!=hidden], button, select, textarea").filter(":not(.easeBM_mainMenu *)").each(function(i, el) {				
							
				el = $(el);				
				type = el.attr("type") || "";

				// Don't display input type=hidden
				if (type!="hidden") {
					// Button
					if (el.prop("tagName") == "BUTTON") {
						label = el.text();
						type = "BUTTON ";

					// Select
					} else if (el.prop("tagName") == "SELECT") {
						label = el.attr("id")?$("*[for="+el.attr("id")+"]").text():"";
						type = "SELECT: ";
						label = label?label:locale.inspector.noLabel;

					// Textarea
					} else if (el.prop("tagName") == "TEXTAREA") {
						label = el.attr("id")?$("*[for="+el.attr("id")+"]").text():"";
						type = "TEXTAREA: ";
						label = label?label:locale.inspector.noLabel;

					// Input
					} else {
						label = el.attr("id")?$("*[for="+el.attr("id")+"]").text():"";

						// Input type = submit
						if (type=="submit") {
							label = el.attr("value");

						// Input type = image
						} else if (type=="image") {
							label = el.attr("alt") || locale.inspector.noAlt;
						} else {
							label = label?label:locale.inspector.noLabel;
						}
						type = type?"INPUT "+type+": ":"INPUT text: ";												
					}

					// Add id
					if (el.attr("id")) {
						label += " - id: "+el.attr("id");
					}

					$("#easeBM_inspectorElementSelect").append("<option>"+$().truncateString(type+label, me.stringMaxLength)+"</option>");
				}
			});
		}

		// Display table
		,"fillElementList_table": function() {
			var me = this;

			// Find tables
			this.elementList = $("table").filter(":not(.easeBM_mainMenu *)").each(function(i, el) {
				var size = tools.getTableLength($(el));				
				var text = tools.tpl(locale.inspector.tableDesc)({"numCol": size.cols, "numRow": size.rows});				
				var caption = $(el).find("caption").text() || $(el).text().trim();

				if (caption) { text+=", "+caption}
				$("#easeBM_inspectorElementSelect").append("<option>"+$().truncateString(text, me.stringMaxLength)+"</option>");
			});
		}

		// Display images
		,"fillElementList_image": function() {
			var me = this;

			// Find images			
			this.elementList = $("img").filter(":not(.easeBM_mainMenu *)").each(function(i, el) {
				var value = $(el).attr("alt") || "";
				value+= $(el).attr("src")?((value?" - ":"")+$(el).attr("src")):"";
				
				$("#easeBM_inspectorElementSelect").append("<option>"+$().truncateString(value, me.stringMaxLength)+"</option>");
			});
		}

		// Lang attribute
		,"fillElementList_lang": function() {
			var me = this;

			// Find element with lang attribute
			this.elementList = $("[lang]").each(function(i, el) {
				var lang = $(el).attr("lang");
				var tag = $(el).prop("tagName");
				$("#easeBM_inspectorElementSelect").append("<option>"+$().truncateString(tag+" : "+lang+" - "+$(el).text(),me.stringMaxLength)+"</option>");
			});
		}

		// Inline styles
		,"fillElementList_inlineStyle": function() {
			var me = this;

			// Find inline styles
			this.elementList = $("body [style]").filter(":not(.easeBM_mainMenu, .easeBM_mainMenu *)").each(function(i, el) {
				var style = $(el).attr("style");
				var tag = $(el).prop("tagName");
				$("#easeBM_inspectorElementSelect").append("<option>"+$().truncateString(tag+" : "+style, me.stringMaxLength)+"</option>");
			});
		}

		// Display links
		,"fillElementList_link": function() {
			var me = this;

			// Fill list with images
			this.elementList = $("a").filter(":not(.easeBM_mainMenu *)").each(function(i, el) {
				
				var value = $(el).attr("title") || "";
				value+= $(el).text()?((value?" - ":"")+$(el).text()):"";
				value+= $(el).attr("href")?(value?" - ":"")+$(el).attr("href"):"";
				
				$("#easeBM_inspectorElementSelect").append("<option>"+$().truncateString(value, me.stringMaxLength)+"</option>");
			});
		}

		// Display roles
		,"fillElementList_role": function() {
			var me = this;

			// Fill list with ARIA element
			this.elementList = $("[role]").filter(":not(.easeBM_mainMenu *)").each(function(i, el) {
				var role = $(el).attr("role");
				var tag = $(el).prop("tagName");
				$("#easeBM_inspectorElementSelect").append("<option>"+$().truncateString(tag+" : "+role, me.stringMaxLength)+"</option>");
			});
		}

		// Display sections
		,"fillElementList_html5": function() {
			var me = this;

			// Fill list with sections
			this.elementList = $("nav, section, header, footer, banner, aside, article, figure, details, output").filter(":not(.easeBM_mainMenu *)").each(function(i, el) {
				var tag = $(el).prop("tagName");
				$("#easeBM_inspectorElementSelect").append("<option>"+$().truncateString(tag, me.stringMaxLength)+"</option>");
			});
		}

		// Display frames
		,"fillElementList_frame": function() {
			var me = this;

			// Fill list with frame and iframe
			this.elementList = $("frame, iframe").filter(":not(.easeBM_mainMenu *)").each(function(i, el) {
				var tag = $(el).prop("tagName");
				var title = ($(el).prop("title") || $(el).prop("src")) || "";
				
				$("#easeBM_inspectorElementSelect").append("<option>"+$().truncateString(tag+" "+title, me.stringMaxLength)+"</option>");
			});
		}

		// Init lists events
		,"initListsEvent": function() {		
			var me = this;

			// Init select event
			$("#easeBM_inspectorTypeSelect").click(function(e) {me.selectElementType(e);});
			$("#easeBM_inspectorTypeSelect").keydown(function(e) {				
				if (e.keyCode == 13) { 		// enter key code
					me.selectElementType(e);
				}
			});

			// Move to selected element
			$("#easeBM_inspectorElementSelect").click(function(e) { me.selectElement(); });
			$("#easeBM_inspectorElementSelect").keydown(function(e) {
				if (e.keyCode == 13) { 		// enter key code
					me.selectElement(); 
				}
			});
		}

		// Move to element
		,"moveToElement": function(el) {			
			window.scroll(0, $(el).offset().top-$("#easeBM_endMenu").position().top-50);
		}

		// Select a type of element
		,"selectElementType": function(e, value) {
			var me = this;

			// Remove all type classes
			$("body").removeClassByPrefix("easeBM_inspector_");

			// If a default value is passed, select it
			if (value) {
				$("#easeBM_inspectorTypeSelect").val(value);
			}

			if (this.isDisplayed) {
				// Add selected type class
				$("#easeBM_inspectorTypeSelect option:selected").each(function(i, el) {					
					$("body").addClass("easeBM_inspector_"+($(el).attr("value")));
				});		
			}

			// Display elements
			var type = e?$(e.target).attr("value"):(value || me.currentType);

			this.currentType = type;

			if (type!="") {
				this.fillElementList(type);			
			}
		}

		/* Hide HTML tags */
		,"hideHTML": function() {
			// Remove all type classes
			$("body").removeClassByPrefix("easeBM_inspector_");
		}

		// selectElement
		,"selectElement": function() {
			var el = this.elementList[$("#easeBM_inspectorElementSelect").prop("selectedIndex")];
			this.moveToElement(el);
			
			// Highlight
			$(".easeBM_highlight").removeClass("easeBM_highlight");
			$(el).addClass("easeBM_highlight");
		}

		// Export
		,"export": function() {
			var me = this, doc;

			if (this.exportWindow) {
				this.exportWindow.close();
			}
			
			// Open new window
			this.exportWindow = this.initNewDoc();
			doc = this.exportWindow.document;									

			// Export elements list in new window
			$("#easeBM_inspectorElementSelect option").each(function(i, el) {					
				var element = doc.createElement("div");
				element.innerHTML = $(el).text();
				me.exportWindow.document.body.appendChild(element);
			});		
			
		}

		// Init alternative window
		,"initNewDoc": function() {
			var win = window.open("");
			var doc = win.document;

			// Create HTML content from template			
			var content = exportTpl({
				"locale":locale				
				,"config":config				
			});	

			// Write HTML content into the document
			doc.open();
			doc.write(content);
			doc.close();

			return win;
		}		

	}
});