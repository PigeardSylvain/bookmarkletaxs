/* alternative tool */
define(["jquery", "i18n!nls/locale", "config", "tpl!tools/screenReaderViewTool/main.tpl", "tpl!tools/screenReaderViewTool/popup.tpl", "common/tools.js"], function($, locale, config, mainTemplate, popupTpl, tools) {	
	return {
		linkList: []					// Link list
		,headerList: []					// header list
		,formList: []					// form list
		,focusElementBackup: null		// backup focused element when a popin is open
		
		,linkId: 0
		,formId: 0
		,headerId: 0

		// Start alternative tool
		,"start": function() {		
			var me = this;
			
			// Reverse jquery plugin
			$.fn.reverse = [].reverse;

			// Remove bookmarklet window
			$(".easeBM_mainMenu").remove();			

			// Remove hidden elements
			$("body :hidden").remove();
			$('body *').filter(function() {
				return $(this).css('visibility') == 'hidden';
			}).remove();

			// Remove br
			$("br").remove();

			// Remove object (flash ...), iframe ...
			$("object").remove();
			$("embed").remove();

			// iframe
			$("iframe").each(function(i, element) {				
				var tag = $(this).prop("tagName");
	    		$(element).replaceWith("<span title='"+tag+"' class='"+tag+"'>"+locale.screenReader.iframe+"</span>");
    		});    	

			//$("iframe").remove();

			var nbTitle = $("h1, h2, h3, h4, h5, h6").length;
			
			// Add title									
    		$("body").prepend("<span class='easeBM_INFO'>"+$("title").text()+" "+tools.tpl(locale.screenReader.title)({"nbTitle":nbTitle, "nbLink": $("a").length})+"</span><br>");

			// -- ARIA --

			// Role search
			$("div[role=search]").reverse().each(function(i, element) {				
				var tag ="ARIA";		
	    		$(element).replaceWith("<span title='"+tag+"' class='"+tag+"'>"+locale.screenReader.searchSection+"</span>"+$(this).html()+"<span title='"+tag+"' class='"+tag+"'>"+locale.screenReader.endSearchSection+"</span><br>");
    		});

			// Role banner
			$("div[role=banner]").reverse().each(function(i, element) {				
				var tag ="ARIA";		
	    		$(element).replaceWith("<span title='"+tag+"' class='"+tag+"'>"+locale.screenReader.bannerSection+"</span>"+$(this).html()+"<span title='"+tag+"' class='"+tag+"'>"+locale.screenReader.endBannerSection+"</span><br>");
    		});    		

			// Role main
			$("div[role=main]").reverse().each(function(i, element) {				
				var tag ="ARIA";		
	    		$(element).replaceWith("<span title='"+tag+"' class='"+tag+"'>"+locale.screenReader.mainSection+"</span>"+$(this).html()+"<span title='"+tag+"' class='"+tag+"'>"+locale.screenReader.endMainSection+"</span><br>");
    		});    		    		

			// Role contentinfo
			$("div[role=contentinfo]").reverse().each(function(i, element) {				
				var tag ="ARIA";		
	    		$(element).replaceWith("<span title='"+tag+"' class='"+tag+"'>"+locale.screenReader.contentInfoSection+"</span>"+$(this).html()+"<span title='"+tag+"' class='"+tag+"'>"+locale.screenReader.endContentInfoSection+"</span><br>");
    		});    		

			// Role complementary
			$("div[role=complementary]").reverse().each(function(i, element) {				
				var tag ="ARIA";		
	    		$(element).replaceWith("<span title='"+tag+"' class='"+tag+"'>"+locale.screenReader.complementarySection+"</span>"+$(this).html()+"<span title='"+tag+"' class='"+tag+"'>"+locale.screenReader.endComplementarySection+"</span><br>");
    		});    		    		

			// Role article
			$("div[role=article]").reverse().each(function(i, element) {				
				var tag ="ARIA";		
	    		$(element).replaceWith("<span title='"+tag+"' class='"+tag+"'>"+locale.screenReader.articleSection+"</span>"+$(this).html()+"<span title='"+tag+"' class='"+tag+"'>"+locale.screenReader.endArticleSection+"</span><br>");
    		});    		    	

    		// Role navigation
			$("div[role=navigation]").reverse().each(function(i, element) {				
				var tag ="ARIA";		
	    		$(element).replaceWith("<span title='"+tag+"' class='"+tag+"'>"+locale.screenReader.navigationSection+"</span>"+$(this).html()+"<span title='"+tag+"' class='"+tag+"'>"+locale.screenReader.endNavigationSection+"</span><br>");
    		});    	

    		// Role tab
			$("*[role=tab]").reverse().each(function(i, element) {				
				var tag ="ARIA";		
				var sel = $(element).attr("aria-selected") === "true" ? " "+locale.screenReader.selected:"";
	    		$(element).replaceWith("<span title='"+tag+"' class='"+tag+"'>"+locale.screenReader.tab+" "+sel+" </span>"+$(this).html());
    		});    	

    		// Find graphic links
    		var graphicLinks = $("a>img").filter(function(i, el) {
    			var a = $(el).parent().clone();
    			a.find("img").remove();
    			return a.html()==="";
			}).parent();

    		// Replace graphic links
    		graphicLinks.reverse().each(function(i, a) {
    			var img = $(a).find("img") || "";
    			var aTitle = $(a).attr("title") || "";
    			var imgTitle = $(img).attr("title") || "";
    			var imgAlt = $(img).attr("alt") || "";
    			var tag = $(this).prop("tagName");
    			var label = "";

    			if (aTitle && !imgTitle && !imgAlt) {
					label = aTitle;
    			} else if (imgTitle && !imgAlt) {
					label = imgTitle
    			} else if (!imgTitle && imgAlt) {
					label = imgAlt;
    			} else if (imgTitle && imgAlt) {
					label = imgAlt;					
    			} else {
    				label = img.attr("src");
    			}
    			// Add to link list
    			me.addLink(label);

    			$(a).replaceWith("<span tabindex='0' title='"+tag+"' class='"+tag+" link"+me.linkId+"'>"+locale.screenReader.graphicLink+" "+$("<div>"+label+"</div>").text()+"</span>");
    		});

			// Replace images
			$("img").each(function(i, image) {
			    var alt=$(this).attr("alt");
			    var src=$(this).attr("src")||"";
			    var tag = $(this).prop("tagName");
			    var img="" 

			    if (typeof(alt)=="undefined") {
			    	img = src;
			    	if ($(image).parent().prop("tagName")==="A") {
			    		$(image).remove();
			    		return true;
			    	}
			    } else {
			    	img = alt;
			    }
			    if (alt==="") {
			    	$(image).remove();
			    } else {
			    	$(image).replaceWith("<span title='"+tag+"' class='"+tag+"'>"+img+"</span>");
			    }
			});			

			// Remove styles
			$("body *").removeAttr("style");
			$("body *").removeAttr("height");
			$("body *").removeAttr("width");
			$("style").remove();
			$("link").remove();

			// Replace h1...h6
			$("h1, h2, h3, h4, h5, h6").each(function(i, head) {
				var tag = $(this).prop("tagName");    	
				var label = $(this).html();		

				// Add to link list
    			me.addHeader("H"+tag.substring(1)+": "+label);

	    		$(head).replaceWith("<span title='"+tag+"' class='"+tag+" header"+me.headerId+"'>"+locale.screenReader.titleLevel+" "+tag.substring(1)+" : "+label+"</span>");	    		
    		});			

    		// Replace link
			$("a").each(function(i, link) {				
				var tag = $(this).prop("tagName");
				var title = $(this).attr("title") || "";
				var value = title.length>$(this).text()?title:$(this).html();

				// Add to link list
				me.addLink(value);

	    		$(link).replaceWith("<span tabindex='0' title='"+tag+"' class='"+tag+" link"+me.linkId+"'>lien : "+value+"</span>");
    		});    								

    		// Replace lists    		
			$("ul, ol").reverse().each(function(i, element) {				
				var tag = $(this).prop("tagName");
				var nbElement = $(this).find(">li").length;
	    		$(element).replaceWith("<br><span title='"+tag+"' class='"+tag+"'>liste de "+nbElement+" éléments</span><br>"+$(this).html()+"<span title='"+tag+"' class='"+tag+"'>fin de la liste</span><br>");
    		});

			$("li").reverse().each(function(i, element) {				
				var tag = $(this).prop("tagName");				
	    		$(element).replaceWith("<span title='"+tag+"' class='"+tag+"'>"+$(this).html()+"</span><br>");
    		});

			$("thead, tbody").reverse().each(function(i, element) {
				var tag = $(this).prop("tagName");
	    		$(element).replaceWith($(this).html());
    		});


			// table caption
			$("table>caption").reverse().each(function(i, element) {				
				var tag = $(this).prop("tagName");
	    		$(element).replaceWith("<span title='"+tag+"' class='"+tag+"'>"+$(this).text()+"</span>");
    		});    	

			// table summary
			$("table[summary]").reverse().each(function(i, element) {				
				var tag = $(this).prop("tagName");
	    		$(element).replaceWith("<span title='"+tag+"' class='"+tag+"'>Résumé : "+$(this).attr("summary")+"</span><br>"+$(this).html());
    		});    	

			$("table").reverse().each(function(i, element) {				
				var tag = $(this).prop("tagName");
				var size = tools.getTableLength($(element));

				// Remove tr, td from current table
				$(element).find("tr, td, th").each(function(i, element) {					
					$(element).replaceWith($(this).html());
				});

	    		$(element).replaceWith("<span title='"+tag+"' class='"+tag+"'>Tableau "+size.cols+" colonnes et "+size.rows+" lignes</span>"+$(this).html()+"<span title='"+tag+"' class='"+tag+"'>Fin du tableau</span><br>");

    		});

			// -- HTML5 --

			// section
			$("section").reverse().each(function(i, element) {				
				var tag = $(this).prop("tagName");
	    		$(element).replaceWith("<span title='"+tag+"' class='"+tag+"'>Début de la région</span>"+$(this).html()+"<span title='"+tag+"' class='"+tag+"'>Fin de la région</span><br>");
    		});    	

			// nav
			$("nav").reverse().each(function(i, element) {				
				var tag = $(this).prop("tagName");
	    		$(element).replaceWith("<span title='"+tag+"' class='"+tag+"'>Début de la région navigation</span>"+$(this).html()+"<span title='"+tag+"' class='"+tag+"'>Fin de la région navigation</span><br>");
    		});    	

			// aside
			$("aside").reverse().each(function(i, element) {				
				var tag = $(this).prop("tagName");
	    		$(element).replaceWith("<span title='"+tag+"' class='"+tag+"'>Début de la région complémentaire</span>"+$(this).html()+"<span title='"+tag+"' class='"+tag+"'>Fin de la région complémentaire</span><br>");
    		});    	    		

			// footer
			$("footer").reverse().each(function(i, element) {				
				var tag = $(this).prop("tagName");
	    		$(element).replaceWith("<span title='"+tag+"' class='"+tag+"'>Début de la région info contenu</span>"+$(this).html()+"<span title='"+tag+"' class='"+tag+"'>Fin de la région info contenu</span><br>");
    		});    	    		

			// -- FORMULAIRES --

			// fieldset legend
			$("fieldset>legend").reverse().each(function(i, element) {				
				var tag = $(this).prop("tagName");
	    		$(element).replaceWith("<span title='"+tag+"' class='"+tag+"'>Légende : "+$(this).text()+"</span><br>");
    		});    	    		

			// Remove other tag
			this.remove("div", true);			
			this.remove("p");
			this.remove("b");
			this.remove("i");
			this.remove("strong");
			this.remove("em");
			this.remove("hr");
			this.remove("fieldset");			
			this.remove("applet");
			this.remove("cite");
			this.remove("var");
			this.remove("dfn");
			this.remove("footer");

			// Input type = image
			$("input[type=image]").reverse().each(function(i, element) {				
				var tag = $(this).prop("tagName");				
				var alt = $(this).attr("alt") || "";
				var label = alt+" bouton"; 
				me.addForm(label);
	    		$(element).replaceWith("<span title='"+tag+"' class='"+tag+" form"+me.formId+"'>"+label+"</span>");	    		
    		});			
			
			// Input type = text
			$("input[type=text], input[type=search], input:not([type])").reverse().each(function(i, element) {				
				var tag = $(this).prop("tagName");								
				var label = $(this).attr("id")?$("label[for='"+$(this).attr("id")+"']").text():"";
				var value = $(this).val() || "";
				me.addForm(label);
	    		$(element).replaceWith("<span title='"+tag+"' class='"+tag+" form"+me.formId+"'>édition "+label+ " " + value+" taper le texte</span>");	    		
    		});			

			// Input type = text
			$("textarea").reverse().each(function(i, element) {				
				var tag = $(this).prop("tagName");								
				var label = $(this).attr("id")?$("label[for='"+$(this).attr("id")+"']").text():"";				
				me.addForm(label);
	    		$(element).replaceWith("<span title='"+tag+"' class='"+tag+" form"+me.formId+"'>édition "+label+" taper le texte</span>");	    		
    		});			

			// Input type = button
			$("input[type=button]").reverse().each(function(i, element) {				
				var tag = $(this).prop("tagName");	
				var alt = $(this).attr("alt") || $(this).attr("value");
				var label = alt+" bouton";
				me.addForm(label);
	    		$(element).replaceWith("<span title='"+tag+"' class='"+tag+" form"+me.formId+"'>"+label+"</span>");	    		
    		});			

			// Input type = submit
			$("input[type=submit]").reverse().each(function(i, element) {				
				var tag = $(this).prop("tagName");	
				var alt = $(this).attr("alt") || $(this).attr("value") || $(this).text();
				var label = alt+" bouton";
				me.addForm(label);
	    		$(element).replaceWith("<span title='"+tag+"' class='"+tag+" form"+me.formId+"'>"+label+"</span>");	    		
    		});			

			// Input type = radio
			$("input[type=radio]").reverse().each(function(i, element) {				
				var tag = $(this).prop("tagName");					
				var desc = ($(this).is(':checked'))?"bouton radio coché":"bouton radio non coché";
				var label = $(this).attr("id")?" "+$("label[for='"+$(this).attr("id")+"']").text():"";
				me.addForm(desc+label);
	    		$(element).replaceWith("<span title='"+tag+"' class='"+tag+" form"+me.formId+"'>"+desc+label+"</span>");	    		
    		});		

			// Input type = checkbox
			$("input[type=checkbox]").reverse().each(function(i, element) {				
				var tag = $(this).prop("tagName");					
				var desc = ($(this).is(':checked'))?"case à cocher cochée":"case à cocher non cochée";
				var label = $(this).attr("id")?" "+$("label[for='"+$(this).attr("id")+"']").text():"";
				me.addForm(desc+label);
	    		$(element).replaceWith("<span title='"+tag+"' class='"+tag+" form"+me.formId+"'>"+desc+label+"</span>");	    		
    		});		

			// Select
			$("select").reverse().each(function(i, element) {				
				var tag = $(this).prop("tagName");				
				var label = $(this).attr("id")?$("label[for='"+$(this).attr("id")+"']").text():"";
				var value = $(this).find(" :selected").text();
				// option
				$(element).find("option").each(function(i, element) {
					$(element).remove();
				});
				me.addForm(label+value);
	    		$(element).replaceWith("<span title='"+tag+"' class='"+tag+" form"+me.formId+"'>Zone de liste déroulante "+label+value+"</span>");	    		
    		});			

			// Remove form tag
			this.remove("form");

			// @TODO
			// dd, dt
			// abbr

			// Button
			$("button").reverse().each(function(i, element) {				
				var tag = $(this).prop("tagName");	
				var alt = $(this).attr("alt") || $(this).text();
				var label = alt+" bouton";
				me.addForm(label);
	    		$(element).replaceWith("<span title='"+tag+"' class='"+tag+" form"+me.formId+"'>"+label+"</span>");	    		
    		});			

			// Remove extra br
			$(".H1+br, .H2+br, .H3+br, .H4+br, .H5+br, .H6+br").remove();

			// Add custom style in the current page
			this.addCustomStyles();					
	
			// Insert template
			this.insertTemplate();

			// Compute lists
			this.computeLists();

		}

		// Add custom style (in the original document)
		,"addCustomStyles": function() {
			var style = document.createElement("link");
			$(style).attr("href", config.root+"tools/screenReaderViewTool/style.css?"+config.version);
			$(style).attr("type", "text/css");
			$(style).attr("rel", "stylesheet");			
			document.head.appendChild(style);
		}

		// Insert banner
		,insertTemplate: function() {			
			var html = $("body").html();

			$("body").html(mainTemplate({
				"html": html
			}));
		}

		// Remove tag
		,remove: function(selector, removeFromDoc) {    		
			$(selector).reverse().each(function(i, element) {
				var tag = $(this).prop("tagName");
				if(removeFromDoc) {
					$(element).replaceWith($(this).html());
				} else {					
	    			$(element).replaceWith("<span class='"+tag+"'>"+tag+"</span>"+$(this).html());
	    		}
    		});

		}

		// add to link list
		,addLink: function(label) {
			this.linkId++;
			this.linkList.push(this.stripHtml(label));
		}

		// add to header list
		,addHeader: function(label) {
			this.headerId++;			
			this.headerList.push(this.stripHtml(label));
		}

		// add to form list
		,addForm: function(label) {
			this.formId++;
			this.formList.push(this.stripHtml(label));
		}

		// strig html tag
		,stripHtml: function(html) {
			return $("<div>"+html+"<div>").text();
		}

		// compute lists
		,computeLists: function() {			
			// Compute link list				
			this.computeList("link");

			// Compute header list				
			this.computeList("header");

			// Compute form list			
			this.computeList("form");
		}

		// Compute list
		,computeList: function(type) {
			var html = "", me = this;
			
			this[type+"List"].forEach(function(el, i) {
				var val = $.trim(el);
				if (val != "") {
					html+= "<option title='"+el+"' value='"+type+(i+1)+"'>"+val+"</option>"
				}
			});

			// Generate popup
			$("body").append(popupTpl({
				"title": locale.screenReader[type+"List"]
				,"className": "easeBM_"+type+"List"
				,"itemList": html
			}));

			// Close button			
			$(".easeBM_"+type+"List button").click(function() {				
				me.closePopin(type);
			});

			// Init event, open popin
			$("#"+type+"Button").click(function(el) {
				me.focusElementBackup = el.target;
				$(".easeBM_listContainer").show();				
				$(".easeBM_"+type+"List").fadeIn();				
				window.setTimeout(function() {
					$(".easeBM_"+type+"List select").focus();
				},100);				
			});

			// Manage escape key
			$(".easeBM_"+type+"List").keydown(function(e) {
				if (e.keyCode == 27) { 		// escape key code
					me.closePopin(type);
				}
			});

			// scroll to selected element + highlight
			//Click event
			$(".easeBM_"+type+"List select").click(function(el) {me.selectListItem($(el.target), type);});
			// Enter key event
			$(".easeBM_"+type+"List select").keydown(function(e) {
				if (e.keyCode == 13) { 		// enter key code
					var el = $(this).find(":selected");
					me.selectListItem(el, type);					
				}
			});

			// Keep focus in the popin
			$(".easeBM_"+type+"List, .focusBlocker").focus(function() {$(".easeBM_"+type+"List select").focus();});						
		}

		// Close popin
		,closePopin: function(type) {
			var me = this;
			
			$(".easeBM_"+type+"List").fadeOut();	
			$(".easeBM_listContainer").hide();
			window.setTimeout(function() {
				me.focusElementBackup.focus();			
			},100);
			
		}

		// Highlight popin selected item
		,selectListItem: function(el, type) {
			// Remove previous highlight element
			$(".highlight").removeClass("highlight");
			
			// Scroll				
			var element = $("."+el.attr("value"));
			window.scroll(0, element.offset().top-80);
			// Hightlight
			$("."+el.attr("value")).addClass("highlight");

			// Close popin
			//this.closePopin(type);			
		}
	}
});