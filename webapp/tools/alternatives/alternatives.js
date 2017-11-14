/* alternative tool */
define(["jquery", "i18n!nls/locale", "tpl!tools/alternatives/alternatives.tpl", "tpl!tools/alternatives/item.tpl", "config"], function($, locale, mainTpl, itemTpl, config) {	
	return {
		"win": null				// alternative tool window
		,"rate": 0
		,"enabled": false
		,"nbError":0
		,"nbEmpty":0
		,"nbValid":0
		,"nbImages":0		
		,"isFresh": true
		,"isInit": false

		// Init page menu
		,"initPageMenu": function() {
			var me = this;
			
			// Alternative tool link
			$("#easeBM_altToolLink").click(function() {									

				// Init first
				if (!me.isInit) {
					me.init();
				}

				if (!me.enabled) {
					// Start alternative tool
					me.start();				
				}

				// Hide home tools page and display alt page
				$("#easeBM_toolsHome").hide();
				$("#easeBM_toolsAlternative").fadeIn();
				$("#easeBM_altBackButton").focus();
			});				
		}

		// Init
		,"init": function() {
			var me = this;

			// Create rate widget
			$("#easeBM_toolsAlternative #easeBM_altRateWidget").easeBM_rateWidget();				

			// Back button click event
			$("#easeBM_altBackButton").click(function() {me.back();})	
			
			$("#easeBM_toolsAlternative .easeBM_pageContent").keydown(function(e) {
				console.log(e);
				if (e.keyCode == 27) { 		// escape key code
					me.back();
				}
			})				

			// Restart button event
			$("#easeBM_altRestartButton").click(function() {					
				me.start();
			});

			this.isInit = true;
		}

		// Back to tool menu
		,"back": function() {
			var me = this;

			// Hide alternative tools page and display home tools page
			$("#easeBM_toolsAlternative").hide();
			$("#easeBM_toolsHome").fadeIn();
			$("#easeBM_altToolLink").focus();

			// Clean custom classes that may be used by alternative tool
			$(".easeBM_altSelected").removeClass("easeBM_altSelected");
			
			// Close alternative window
			if (me.win) {
				me.win.close();
			}
		}

		// Reset default values
		,"initDefaultValues": function() {
			this.rate=this.nbError=this.nbEmpty=this.nbValid=this.nbImages=0;
			this.isFresh = true;
		}

		// Start alternative tool
		,"start": function() {		

			// If an alternative window was already open, close it			
			if (this.win) {
				this.win.close();				
			}

			// Init default values
			this.initDefaultValues();				

			// Open new window and init its content
			this.win = window.open("");				
			this.initNewDoc();			

			// Add custom style in the current page
			this.addCustomStyles();

			this.enabled = true;

			// Load images
			this.loadImages();

			// Init banner event
			this.initBanner();

			// Init image event					
			this.enableImagesEvent();

			// Init info buttons event
			this.enableInfoButtons();

			// Remove all images inline style
			$(this.win.document.images).attr("style", "");						
		}

		// Init alternative window
		,"initNewDoc": function() {
			var doc = this.win.document;

			// Create HTML content from template			
			var content = mainTpl({
				"locale":locale				
				,"config":config				
			});	

			// Write HTML content into the document
			doc.open();
			doc.write(content);
			doc.close();
		}

		// Load images
		,"loadImages":function() {
			var images = document.images;
			var type, label = "", doc = this.win.document;
			var html = "", tmpEl, textElement;
			this.nbImages = images.length;

			// For all images
			for (var i=0;i<this.nbImages;i++) {	

				// Get alt attribute
				var alt = images[i].getAttribute("alt");				

				if (!alt) {	
					// Empty alternative
					if (alt=="") {
						label = locale.alternative.emptyAlternative;						
						this.nbEmpty++;
						type="empty";

					// No alternative				
					} else {
						label = locale.alternative.noAlternative;						
						this.nbError++;		
						type="error";			
					}
				// Valid alternative
				} else {
					label = locale.alternative.validAlternative+": "+alt;					
					this.nbValid++;
					type="valid";
				}

				// Get image source code
				textElement = $("<div>").text($('<div>').append($(images[i]).clone()).html()).html();
 
				// add unique id
				tmpEl = $(document.images[i]).clone().attr("id",i);				

				// Create a new item for this image
				html += itemTpl({
					"state": type
					,"element": textElement
					,"label": "&nbsp;&nbsp;"+label
					,"img": tmpEl[0].outerHTML
					,"locale": locale
				});								

			}

			// Add all items to the document
			doc.body.innerHTML += '<div class="content">'+html+'</div>';			

			// Update banner info
			this.updateBanner();
		}

		// Init banner
		,"initBanner": function() {	
			var me = this;				

			$(this.win.document).find(":radio").click(function() {							
				var body = me.win.document.body;
			    if (this.checked) {
			     	if($(this).val() == 'all') {
			        	$(body).addClass("typeError typeEmpty typeValid");
			        } else if($(this).val() == 'error') {
			        	$(body).removeClass("typeEmpty typeValid");
			        	$(body).addClass("typeError");
			        } else if($(this).val() == 'empty') {
			        	$(body).removeClass("typeError typeValid");
			        	$(body).addClass("typeEmpty");
			        } else {
			        	$(body).removeClass("typeError typeEmpty");
			        	$(body).addClass("typeValid");
			        }
			    }		    
			});				

			// Manage keyboard accessibility
			$(this.win.document).find("label").keydown(function(e) {
				if (e.keyCode == 13) {		// enter key										
					$(me.win.document).find("#"+$(e.target).attr("for")).click().click();					
				}
			});			
		}

		// Update banner info
		,"updateBanner": function() {

			var doc = this.win.document;
			var me = this;

			doc.getElementById("rAllLabel").innerHTML   = locale.alternative.all   + " <span class='mini'>("+this.nbImages+")</span>";
			doc.getElementById("rErrorLabel").innerHTML = locale.alternative.error + " <span class='mini'>("+this.nbError+")</span>";
			doc.getElementById("rEmptyLabel").innerHTML = locale.alternative.empty + " <span class='mini'>("+this.nbEmpty+")</span>";
			doc.getElementById("rValidLabel").innerHTML = locale.alternative.valid + " <span class='mini'>("+this.nbValid+")</span>";

			if (this.nbImages == 0) {
				rate = 100;
			} else {
				rate = Math.round((this.nbImages-this.nbError)*100/this.nbImages);
				if (rate==100 && this.nbError>0) {
					rate=99;
				}
			}

			doc.getElementById("details").innerHTML = "<span class='bold'>"+this.nbError+((this.nbError>0)?locale.alternative.errorsOn:locale.alternative.errorOn)+this.nbImages+" "+((this.nbImages>0)?locale.alternative.images:locale.alternative.image)+" - "+locale.alternative.rate+" : "+rate+" %";

			if (this.isFresh) {					
				// Update bookmarklet menu next time it receives the focus
				$(window).one("focus", function() {									
					$("#easeBM_altRateWidget").easeBM_rateWidget("update", rate);
					me.isFresh = true;
					$("#easeBM_altBackButton").focus();
				});				
				this.isFresh = true;
			}			
		}

		// Enable images event
		,"enableImagesEvent": function() {
			var me = this;
			
			// Click event			
			$(this.win.document).find(".element").click(function(e) {
				// If this is a user error element
				if ($(this.parentElement).hasClass("userError")) {
					// Remove error
					$(this.parentElement).removeClass("userError");
					me.nbError--;

					if ($(this.parentElement).hasClass("valid")) {
						me.nbValid++;
					}
					if ($(this.parentElement).hasClass("empty")) {
						me.nbEmpty++;
					}
				// If this is a valid or empty element
				} else if ($(this.parentElement).hasClass("valid")) {
					me.nbValid--;
					$(this.parentElement).addClass("userError");
					me.nbError++;
				} else if ($(this.parentElement).hasClass("empty")) {
					me.nbEmpty--;
					$(this.parentElement).addClass("userError");
					me.nbError++;
				} else {
					return true;
				}

				// Update banner
				me.updateBanner();
			});

		}

		// Add custom style (in the original document)
		,"addCustomStyles": function() {
			if (!this.enabled) {
				var style = document.createElement("style");
				style.innerHTML = ".easeBM_altSelected {outline: 2px dotted red !important;border: 2px solid red;}";
				document.head.appendChild(style);					
				$("body").addClass("easeBM_altEnabled");		
			}		
		}

		// Enable info buttons
		,"enableInfoButtons": function() {
			var me = this;
			$(this.win.document).find(".infoButton").click(function() {
				$(this.parentElement).toggleClass("infoDisplayed");
				this.blur();
			});
			$(this.win.document).find(".findButton").click(function() {						
				// Remove class for previous selected image			
				if (me.selectedImageId) {
					$(document.images[me.selectedImageId]).removeClass("easeBM_altSelected");
				}

				// Add class for new selected image
				me.selectedImageId = $(this.parentElement).find("img").attr("id");			

				var target = document.images[me.selectedImageId];
				$(target).addClass("easeBM_altSelected");
				window.scroll(0, $(target).offset().top-$("#easeBM_endMenu").position().top-50);
				alert(locale.alternative.highlight);
				this.blur();
			});
		}
	}
});