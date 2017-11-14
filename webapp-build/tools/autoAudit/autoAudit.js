/* inspector tool */
define(["jquery", "i18n!nls/locale", "config", "tpl!tools/autoAudit/main.tpl", "common/tools", "tpl!tools/autoAudit/export.tpl", "tools/inspector/inspector"], function($, locale, config, mainTpl, tools, exportTpl, inspector) {	
	return {
		
		"hasInit": false
		,"stringMaxLength": 90			// truncate large strings
		,"auditResult": null 			// audit object

		,"TYPE_ERROR": "error"
		,"TYPE_WARNING": "warning"
		,"TYPE_VALID": "valid"
		,"TYPE_NOTICE": "notice"

		// start tool
		,"start": function() {

			// Init first time
			if (!this.hasInit) {
				this.init();				
			}

			// Auto audit 
			this.audit();
			
			// Display audit auto page
			this.display();

		}

		// Init
		,"init": function() {
			var me = this;

			// Init back button
			$("#easeBM_autoAuditBackButton").click(function() {
				me.hide();
			});

			// Escape key
			$("#easeBM_autoAudit").keydown(function(e) {
				if (e.keyCode == 27) { 		// escape key code
					me.hide();
				}
			});			

			// Init export button
			$("#easeBM_autoAuditExportButton").click(function() {
				me.export();
			});

			this.hasInit = true;
		}

		// Display auto audit tool page
		,"display": function() {				
			$("#easeBM_auditSection>div").hide();		// Hide other tool pages
			$("#easeBM_autoAudit").fadeIn();			// Display auto audit page			
		}

		// Hide auto audit tool page
		,"hide": function() {				
			$("#easeBM_auditSection>div").hide();		// Hide other tool pages
			$("#easeBM_auditHome").fadeIn();
			$("#easeBM_auditStartButton").focus();		// Restore focus
		}

		// Audit
		,"audit": function() {

			var me = this;

			// Object use for template
			var tplObject = {
				"locale": locale
			}

			// Init auditResult object
			this.auditResult = {
				"nbError": 0
				,"nbValid": 0
				,"nbWarning": 0
				,"tests": []
			}
				
			// Check page title
			this.checkPageTitle();

			// Check image			
			this.checkImage();

			// check frames
			this.checkFrames();

			// check headings
			this.checkHeadings();

			// inline styles checking
			this.checkInlineStyles();

			// language checking
			this.checkLanguage();

			// table checking
			this.checkTable();

			// check form
			this.checkForm();

			// Create audit result
			this.auditResult.tests.forEach(function(test, i) {
				tplObject[test.name] = (tplObject[test.name]||"") + me.getTestMessage(test);
			});

			// Display resume
			tplObject.resume = tools.tpl(locale.autoAudit.resume)({"nbError": this.auditResult.nbError, "nbWarning": this.auditResult.nbWarning});

			var html = mainTpl(tplObject);

			// Insert HTML
			$("#easeBM_autoAuditContent").html(html);			

			// Update scrollbar position
			window.setTimeout(function() {				
				$("#easeBM_autoAuditContent").tinyscrollbar();
			},0);

			// Init links
			this.initLinks();
		}

		// Init links
		,"initLinks": function() {
			var me = this;
			// Open headings
			$(".easeBM_autoAudit_openHeadings").click(function() {
				me.openInspector("header");
			});

			$(".easeBM_autoAudit_openFrames").click(function() {
				me.openInspector("frame");
			});

			// Open inline style
			$(".easeBM_autoAudit_openInline").click(function() {
				me.openInspector("inlineStyle");
			});			

			// Open lang
			$(".easeBM_autoAudit_openLang").click(function() {
				me.openInspector("lang");
			});			

			// Open table
			$(".easeBM_autoAudit_openTable").click(function() {
				me.openInspector("table");
			});						

			// Open form
			$(".easeBM_autoAudit_openForm").click(function() {
				me.openInspector("form");
			});									

			// Open image
			$(".easeBM_autoAudit_openImage").click(function() {
				me.openAltTool();
			});												

		}

		// Check page title
		,"checkPageTitle": function() {
			var title = $("head title");
			
			// More than 1 title found
			if (title.length>1) {				
				return this.addTestResult({
					"name": "pageTitle"
					,"type": this.TYPE_ERROR
					,"message": locale.autoAudit.severalTitles
					,"action": locale.autoAudit.keepOnlyOneTitle
				});
			}

			var title = title.text().trim();

			if (title != "") {
				// Title found								
				return this.addTestResult({"name": "pageTitle", "type": this.TYPE_VALID, "message": $().truncateString(locale.autoAudit.titleFound + title, this.stringMaxLength)});
			}

			// No title								
			return this.addTestResult({"name": "pageTitle", "type": this.TYPE_ERROR, "message": locale.autoAudit.noTitle});
						
		}

		// Add tests into result tests list
		,"addTestResult": function(test) {			
			this.auditResult.tests.push(test);
		}

		// Check frames
		,"checkFrames": function() {
			var me = this;
			var frames = $("iframe");			
			var numFrames = frames.length;

			if (frames.length == 0) {
				return this.addTestResult({"name": "frames", "type": this.TYPE_VALID, "message": locale.autoAudit.noFrameFound, "className": "easeBM_autoAudit_openFrames"});
			} else {
				this.addTestResult({"name": "frames", "type": this.TYPE_NOTICE, "message": tools.tpl(locale.autoAudit.numFramesFound)({"numFrames": numFrames}), "className": "easeBM_autoAudit_openFrames"});
			}

			$("iframe").each(function(i, el) {
				if (!$(el).attr("title")) {					
					var name = $(el).attr("name") || $(el).attr("id");					
					me.addTestResult({"name": "frames", "type": me.TYPE_ERROR, "message": tools.tpl(locale.autoAudit.frameNoTitle)({"num": i+1, "name": name}), "className": "easeBM_autoAudit_openFrames"});
				} else {
					me.addTestResult({"name": "frames", "type": me.TYPE_VALID, "message": "IFRAME "+(i+1)+".", "className": "easeBM_autoAudit_openFrames"});
				}
			});

		}

		// Check headings
		,"checkHeadings": function() {
			var me = this, message;
			var headings = $("h1, h2, h3, h4, h5, h6");

			// No headings tag found
			if (headings.length == 0) {				
				return this.addTestResult({"name": "headings", "type": this.TYPE_ERROR, "message": locale.autoAudit.noHeading});
			}

			// Display number of headings found
			this.addTestResult({"name": "headings", "type": this.TYPE_VALID, "message": tools.tpl(locale.autoAudit.numHeadingsFound)({"numHeadings": headings.length}), "className": "easeBM_autoAudit_openHeadings"});

			// No H1 found			
			if ($("h1").length == 0) {
				this.addTestResult({"name": "headings", "type": this.TYPE_ERROR, "message": locale.autoAudit.noH1Found, "className": "easeBM_autoAudit_openHeadings"});
			}

			// Check nesting
			var currentLevel = headings.first().prop("tagName").substr(-1,1);
			headings.each(function(i, h) {
				var level = $(h).prop("tagName").substr(-1,1)
				if ((level - currentLevel) > 1 || (level - currentLevel) < -1) {
					// Nesting error
					me.addTestResult({"name": "headings", "type": me.TYPE_ERROR, "message": locale.autoAudit.nestingError, "className": "easeBM_autoAudit_openHeadings"});
					return false;
				}
				currentLevel = level;
			});		
		}

		// Check inline style
		,"checkInlineStyles": function() {
			// Check inline styles
			var numStyle = $("[style]").filter(":not(.easeBM_mainMenu, .easeBM_mainMenu *)").length;
			var inlineStyle = tools.tpl(locale.autoAudit.inlineStyle)({"numStyle": numStyle});

			if (numStyle>0) {				
				this.addTestResult({"name": "inlineStyle", "type": this.TYPE_WARNING, "message": inlineStyle, "className": "easeBM_autoAudit_openInline"});
			} else {
				this.addTestResult({"name": "inlineStyle", "type": this.TYPE_VALID, "message": inlineStyle});
			}			
		}

		// Check language
		,"checkLanguage": function() {
			// Check HTML lang attribute
			var lang = $("html").attr("lang");
			if (lang) {				
				this.addTestResult({"name": "language", "type": this.TYPE_VALID, "message": locale.autoAudit.languageFound+lang, "className": "easeBM_autoAudit_openLang"});
			} else {
				this.addTestResult({"name": "language", "type": this.TYPE_ERROR, "message": locale.autoAudit.noLanguage});
			}

			// Check number of lang attribute
			var nbLangAttr = $("[lang]").length;

			// No lang in HTML tag
			if (!lang) {
				// But lang attritbute found in other tag
				if (nbLangAttr>0) {					
					this.addTestResult({"name": "language", "type": this.TYPE_VALID, "message": tools.tpl(locale.autoAudit.otherLangFound)({"nbLangAttr": nbLangAttr}), "className": "easeBM_autoAudit_openLang"});
				}
			} else {
				if (nbLangAttr>1) {					
					this.addTestResult({"name": "language", "type": this.TYPE_VALID, "message": tools.tpl(locale.autoAudit.otherLangFound)({"nbLangAttr": nbLangAttr}),"className": "easeBM_autoAudit_openLang"});
				} else {
					this.addTestResult({"name": "language", "type": this.TYPE_WARNING, "message": locale.autoAudit.noOtherLangFound});
				}
			}			
		}

		// Check table
		,"checkTable": function() {
			var me = this;
			var tables = $("table");

			// Get tables number
			var numTable = tables.length;

			if (numTable>1) {

				// Display table number
				this.addTestResult({"name": "table", "type": this.TYPE_NOTICE, "message": tools.tpl(locale.autoAudit.tableNumber)({"numTable": numTable})});

				$("table").each(function(i, el) {
					var table = $(el);
					var caption = table.find("caption").text();
					var summary = table.find("summary").text();
					var th = table.find("th");

					var label = $().truncateString(locale.autoAudit.table + " " + (i+1) + " : "+ (caption || table.text().trim())+".", me.stringMaxLength);

					// Table must have at least a TH tag and a caption or summary
					if ((caption || summary) && th) {
						me.addTestResult({"name": "table", "type": me.TYPE_VALID, "message": label, "className": "easeBM_autoAudit_openTable"});
					} else {						
						me.addTestResult({"name": "table", "type": me.TYPE_ERROR, "message": label, "className": "easeBM_autoAudit_openTable"});
					}
					
				});
			
			} else {
				// No table found
				this.addTestResult({"name": "table", "type": this.TYPE_VALID, "message": locale.autoAudit.noTableFound});
			}			

		}

		// Check forms
		,"checkForm": function() {
			var me = this;
			var numForm = $("form").length;
			var element = $("input, textarea, select").filter(":not(.easeBM_mainMenu *)").filter(":not(input[type=hidden])").filter(":not(image)").filter(":not(reset)").filter(":not(submit)");
			var numLabel = $("label").length;
			var numElement = element.length;
			var numFieldSet = $("fieldset").length;

			// Form description
			this.addTestResult({"name": "form", "type": this.TYPE_NOTICE, "message": tools.tpl(locale.autoAudit.formDescription)({"numForm": numForm, "numLabel": numLabel, "numElement": numElement, "numFieldSet": numFieldSet})});

			// For each form field
			element.each(function(i, el) {
				var el = $(el), label;
				var id = el.attr("id");
				var tag = el.prop("tagName");
				var type = el.attr("type") || "";

				// Input image
				if (type=="image") {
					label = el.attr("alt");

				// Input submit
				} else if (type=="submit") {
					label = el.attr("value");
					
				// Other type
				} else {
					if (id) {						
						label = $("label[for='"+id+"']").text().trim();
					}
				}

				// Compute field description
				var fieldDescription = tag + " " + type;
				if (label || id) {
					fieldDescription+=" - "+ (label || id);
				}

				if (label) {
					// Field is valid
					me.addTestResult({"name": "form", "type": me.TYPE_VALID, "message": fieldDescription, "className": "easeBM_autoAudit_openForm"});
				} else {
					// Field is not accessible (no label)
					me.addTestResult({"name": "form", "type": me.TYPE_ERROR, "message": fieldDescription, "className": "easeBM_autoAudit_openForm"});
				}

			});
		}

		// Check images
		,"checkImage": function() {			
			var numImage = $("img").length;
			var numNoAlt = 0;
			var numEmptyAlt = 0;
			var numAltValid = 0;

			// No image
			if (numImage == 0) {				
				return this.addTestResult({"name": "image", "type": this.TYPE_VALID, "message": locale.autoAudit.noImage});
			}

			$("img").each(function(i, img) {
				img = $(img);
				if (typeof(img.attr("alt")) == "undefined") {
					numNoAlt++;
				} else if (img.attr("alt").trim() === "") {
					numEmptyAlt++;
				} else {
					numAltValid++;
				}
			});

			var message = tools.tpl(locale.autoAudit.image)({"numImage": numImage, "numNoAlt":numNoAlt, "numEmptyAlt":numEmptyAlt, "numAltValid":numAltValid});
			if (numNoAlt>0) {
				// At least one image without alt attribute				
				return this.addTestResult({"name": "image", "type": this.TYPE_ERROR, "message": message, "className": "easeBM_autoAudit_openImage"});
			}

			// All image with alt attribute			
			return this.addTestResult({"name": "image", "type": this.TYPE_VALID, "message": message, "className": "easeBM_autoAudit_openImage"});
			
		}

		// Get test message
		,"getTestMessage": function(test) {

			if (test.type == this.TYPE_VALID) {
				this.auditResult.nbValid++;	
			} else if (test.type == this.TYPE_ERROR) {
				this.auditResult.nbError++;	
			} else if (test.type == this.TYPE_WARNING) {
				this.auditResult.nbWarning++;	
			}
			
			if (test.className) {
				return '<div class="easeBM_autoAudit_'+test.type+' '+test.className+'"><a>'+test.message+'</a></div>';	
			} else {
				return '<div class="easeBM_autoAudit_'+test.type+'">'+test.message+'</div>';
			}	
		}

		// Export button click
		,"export": function() {
			var doc;

			if (this.exportWindow) {
				this.exportWindow.close();
			}
			
			// Open new window
			this.exportWindow = this.initNewDoc();
			doc = this.exportWindow.document;									

			// Export elements list in new window
			this.exportWindow.document.body.innerHTML = $("#easeBM_autoAuditContent").html();
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

		// Open inspector
		,"openInspector": function(type) {
			// Open inspector
			$("#easeBM_MenuItemFor_tools a").click();

			// Select type
			inspector.display(type);
		}

		// Open alt tool
		,"openAltTool": function() {
			// Open inspector
			$("#easeBM_MenuItemFor_tools a").click();

			// Open alt tool
			$("#easeBM_altToolLink").click();

		}
	}
});