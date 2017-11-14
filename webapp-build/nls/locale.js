define({
	"root": {
		// Menu
		"menu": {
			"auditItem": "audit"
			,"toolsItem": "tools"
			,"configItem": "settings"
			,"helpItem": "help"
			,"aboutItem": "about"
			// Audit
			,"audit": {
				"auto": "Automated accessibility tests."
				,"autoButton": "start"				
			}			
			// Tools page
			,"tools": {
				"alternativeText": "alternative text for images"
				,"inspector": "elements inspector"				
				,"screenReaderView": "vue lecteur d&apos;&eacute;cran"
				,"enableJquery": "enable jQuery"
				,"disableJquery": "disable jQuery"
				,"enableJqueryTip": "Enable jQuery to debug in the browser console"
				,"disableJqueryTip": "Disable jQuery and restore $ variable"
				,"enableConfort": "enable confort d'utilisation"
				,"enabledConfort": "confort d'utilisation enabled"
				,"enableConfortTip": "Enable confort d'utilisation on this page"
				,"enabledConfortTip": "Confort d'utilisation is enabled on this page"
			}
			// Alternative page
			,"alternative": {
				"title": "alternative text for images"
				,"back": "back"
				,"restart": "restart"
			}
			// Settings page
			,"settings": {
				"fontSize": "change font size"
				,"increaseFontSize": "increase"
				,"decreaseFontSize": "decrease"
			}			
			// Help page
			,"help": {
				"shortcuts": "Keyboard shortcuts"
				,"links": "Links"
				,"navigation": "Tab, Enter, Escape : keyboard navigation"
				,"showHide": "Key '²' : show/hide menu"
				,"increaseDecreaseFontSize": "+/- : increase or decrease font size"
				,"WCAG2Link": "http://www.w3.org/TR/WCAG20/"
				,"WCAG2LinkLabel": "Web Content Accessibility Guidelines (WCAG) 2.0"
			}	
			// About page
			,"about": {
				"title": "about EASE bookmarklet"
				,"version": "version"
				,"link": "http://devteam.itn.ftgroup/spip.php?article854"		
				,"page": "Link to devteam page"
			}
		}

		// Alternative tool
		,"alternative": {
			"title": "alternatives - EASE bookmarklet"
			,"emptyAlternative": "empty alt attribute"
			,"noAlternative": "no alt attribute"
			,"validAlternative": "alt attribute specified"
			,"all": "all"
			,"error": "error"
			,"empty": "empty"
			,"valid": "valid"
			,"errorsOn": " errors</span> on "
			,"errorOn": " error</span> on "
			,"image": "image"
			,"images": "images"
			,"rate": "rate"
			,"highlight": "Image has been highlighted."
			,"infoButton": "info"
			,"findButton": "find"
		}	

		// Screen reader tool
		,"screenReader": {
			"linkList": "Links list"
			,"formList": "Form elements list"
			,"headerList": "Headers list"
			,"iframe": "Start frame End frame"
			,"title": "The page contains <%=nbTitle%> title<%(nbTitle>0)?'s':''%>, <%=nbLink%> link<%(nbLink>0)?'s':''%>."
			,"searchSection": "Search section"
			,"endSearchSection": "End search section"
			,"bannerSection": "Banner section"
			,"endBannerSection": "End banner section"
			,"mainSection": "Main section"
			,"endMainSection": "End main section"
			,"contentInfoSection": "Content info section"
			,"complementarySection": "Complementary section"
			,"endComplementarySection": "End Complementary section"
			,"articleSection": "Article section"
			,"endArticleSection": "End article section"
			,"endContentInfoSection": "End content info section"
			,"navigationSection": "Navigation section"
			,"endNavigationSection": "End navigation section"			
			,"selected": "selected"
			,"tab": "Tab"
			,"graphicLink": "image link"
			,"titleLevel": "Title level"
		}

		// Header tag tool
		,"inspector": {			
			"backButton": "Back"						
			,"exportButton": "Export"
			,"displayOnPageTitle": "Display HTML tags on page"
			,"displayOnPage": "HTML"
			,"all": "All"
			,"lang": "Lang attributes"
			,"header": "Headings"
			,"inlineStyle": "Inline styles"
			,"list": "Lists"
			,"form": "Form elements"
			,"table": "Tables"
			,"image": "Images"			
			,"link": "Links"
			,"role": "Roles (ARIA)"
			,"html5": "HTML5 tags"
			,"frame": "Frames"
			,"tableDesc": "<%=numCol%> colonne<%(numCol>1)?'s':''%>, <%=numRow%> ligne<%(numRow>1)?'s':''%>"			
			,"exportTitle": "EASE bookmarklet inspector export"
			,"noLabel": "NO LABEL"
			,"noAlt": "NO ALT ATTRIBUTE"
		}

		// Auto audit
		,"autoAudit": {			
			"back": "Back"
			,"resume": "<strong><%=nbError%> error<%(nbError>1)?'s':''%></strong> and <strong><%=nbWarning%> warning<%(nbWarning>1)?'s':''%></strong> on this page."
			,"inlineStyleTitle": "Inline styles"
			,"inlineStyle": "<%=numStyle%> inline styles attribute<%(numStyle>1)?'s':''%> found."
			,"languageTitle": "Language"
			,"noLanguage": "No language attribute found in the HTML tag."
			,"languageFound": "Language is set in the HTML tag : "			
			,"otherLangFound": "<%=nbLangAttr%> lang attribut<%(nbLangAttr>1)?'s':''%> found in this page."
			,"noOtherLangFound": "No other lang attribute found in the page."
			,"tableTitle": "Data tables"
			,"tableNumber": "<%=numTable%> table<%numTable>1?'s':''%> found."
			,"noTableFound": "No table found."
			,"exportButton": "Export"
			,"table": "Table"
			,"general": "General"
			,"noTitle": "No title found."
			,"titleFound": "Page title : "
			,"severalTitles": "Several titles found."
			,"keepOnlyOneTitle": "Keep only one title tag in the header of the page."
			,"formTitle": "Forms"
			,"formDescription": "<%=numForm%> form<%numForm>1?'s':''%>, <%=numFieldSet%> fieldset<%numFieldSet>1?'s':''%>, <%=numLabel%> label<%numLabel>1?'s':''%>, <%=numElement%> form field<%numElement>1?'s':''%>."
			,"imageTitle": "Images"
			,"image": "<%=numImage%> image<%numImage>1?'s':''%>, <%=numNoAlt%> without alternative text, <%=numAltValid%> with alternative text, <%=numEmptyAlt%> with ampty alt attribute."
			,"noImage": "No image (img tag) found."
			,"frameTitle": "Frame"
			,"frameNoTitle": "IFRAME <%=num%> : <%name?name+', ':''%>no valid title attribute."
			,"noFrameFound": "No frame found."
			,"numFramesFound": "<%numFrames%> frames<%numFrames>1?'s':''%> found (Warning: IFRAME content is not audited)."	
			,"headingsTitle": "Headings"			
			,"noHeading": "No heading tag found (h1, h2 ... h6)."		
			,"numHeadingsFound": "<%numHeadings%> heading<%numHeadings>1?'s':''%> found."	
			,"noH1Found": "No H1 heading tag found."
			,"nestingError": "Nesting error, check headers tag order."
			,"exportTitle": "EASE bookmarklet - audit export"
		}
	},
	"fr": true
});