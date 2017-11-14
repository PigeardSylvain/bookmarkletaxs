
/**
 * @license RequireJS i18n 2.0.1 Copyright (c) 2010-2012, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/requirejs/i18n for details
 */
/*jslint regexp: true */
/*global require: false, navigator: false, define: false */

/**
 * This plugin handles i18n! prefixed modules. It does the following:
 *
 * 1) A regular module can have a dependency on an i18n bundle, but the regular
 * module does not want to specify what locale to load. So it just specifies
 * the top-level bundle, like "i18n!nls/colors".
 *
 * This plugin will load the i18n bundle at nls/colors, see that it is a root/master
 * bundle since it does not have a locale in its name. It will then try to find
 * the best match locale available in that master bundle, then request all the
 * locale pieces for that best match locale. For instance, if the locale is "en-us",
 * then the plugin will ask for the "en-us", "en" and "root" bundles to be loaded
 * (but only if they are specified on the master bundle).
 *
 * Once all the bundles for the locale pieces load, then it mixes in all those
 * locale pieces into each other, then finally sets the context.defined value
 * for the nls/colors bundle to be that mixed in locale.
 *
 * 2) A regular module specifies a specific locale to load. For instance,
 * i18n!nls/fr-fr/colors. In this case, the plugin needs to load the master bundle
 * first, at nls/colors, then figure out what the best match locale is for fr-fr,
 * since maybe only fr or just root is defined for that locale. Once that best
 * fit is found, all of its locale pieces need to have their bundles loaded.
 *
 * Once all the bundles for the locale pieces load, then it mixes in all those
 * locale pieces into each other, then finally sets the context.defined value
 * for the nls/fr-fr/colors bundle to be that mixed in locale.
 */
(function () {
    

    //regexp for reconstructing the master bundle name from parts of the regexp match
    //nlsRegExp.exec("foo/bar/baz/nls/en-ca/foo") gives:
    //["foo/bar/baz/nls/en-ca/foo", "foo/bar/baz/nls/", "/", "/", "en-ca", "foo"]
    //nlsRegExp.exec("foo/bar/baz/nls/foo") gives:
    //["foo/bar/baz/nls/foo", "foo/bar/baz/nls/", "/", "/", "foo", ""]
    //so, if match[5] is blank, it means this is the top bundle definition.
    var nlsRegExp = /(^.*(^|\/)nls(\/|$))([^\/]*)\/?([^\/]*)/;

    //Helper function to avoid repeating code. Lots of arguments in the
    //desire to stay functional and support RequireJS contexts without having
    //to know about the RequireJS contexts.
    function addPart(locale, master, needed, toLoad, prefix, suffix) {
        if (master[locale]) {
            needed.push(locale);
            if (master[locale] === true || master[locale] === 1) {
                toLoad.push(prefix + locale + '/' + suffix);
            }
        }
    }

    function addIfExists(req, locale, toLoad, prefix, suffix) {
        var fullName = prefix + locale + '/' + suffix;
        if (require._fileExists(req.toUrl(fullName))) {
            toLoad.push(fullName);
        }
    }

    /**
     * Simple function to mix in properties from source into target,
     * but only if target does not already have a property of the same name.
     * This is not robust in IE for transferring methods that match
     * Object.prototype names, but the uses of mixin here seem unlikely to
     * trigger a problem related to that.
     */
    function mixin(target, source, force) {
        var prop;
        for (prop in source) {
            if (source.hasOwnProperty(prop) && (!target.hasOwnProperty(prop) || force)) {
                target[prop] = source[prop];
            } else if (typeof source[prop] === 'object') {
                mixin(target[prop], source[prop], force);
            }
        }
    }

    define('i18n',['module'], function (module) {
        var masterConfig = module.config();

        return {
            version: '2.0.1',
            /**
             * Called when a dependency needs to be loaded.
             */
            load: function (name, req, onLoad, config) {
                config = config || {};

                if (config.locale) {
                    masterConfig.locale = config.locale;
                }

                var masterName,
                    match = nlsRegExp.exec(name),
                    prefix = match[1],
                    locale = match[4],
                    suffix = match[5],
                    parts = locale.split("-"),
                    toLoad = [],
                    value = {},
                    i, part, current = "";

                //If match[5] is blank, it means this is the top bundle definition,
                //so it does not have to be handled. Locale-specific requests
                //will have a match[4] value but no match[5]
                if (match[5]) {
                    //locale-specific bundle
                    prefix = match[1];
                    masterName = prefix + suffix;
                } else {
                    //Top-level bundle.
                    masterName = name;
                    suffix = match[4];
                    locale = masterConfig.locale;
                    if (!locale) {
                        locale = masterConfig.locale =
                            typeof navigator === "undefined" ? "root" :
                            (navigator.language ||
                             navigator.userLanguage || "root").toLowerCase();                            
                    }
                    parts = locale.split("-");                    
                }

                if (config.isBuild) {
                    //Check for existence of all locale possible files and
                    //require them if exist.
                    toLoad.push(masterName);
                    addIfExists(req, "root", toLoad, prefix, suffix);
                    for (i = 0; i < parts.length; i++) {
                        part = parts[i];
                        current += (current ? "-" : "") + part;
                        addIfExists(req, current, toLoad, prefix, suffix);
                    }

                    req(toLoad, function () {
                        onLoad();
                    });
                } else {
                    //First, fetch the master bundle, it knows what locales are available.
                    req([masterName], function (master) {
                        //Figure out the best fit
                        var needed = [],
                            part;

                        //Always allow for root, then do the rest of the locale parts.
                        addPart("root", master, needed, toLoad, prefix, suffix);
                        for (i = 0; i < parts.length; i++) {
                            part = parts[i];
                            current += (current ? "-" : "") + part;
                            addPart(current, master, needed, toLoad, prefix, suffix);
                        }

                        //Load all the parts missing.
                        req(toLoad, function () {
                            var i, partBundle, part;
                            for (i = needed.length - 1; i > -1 && needed[i]; i--) {
                                part = needed[i];
                                partBundle = master[part];
                                if (partBundle === true || partBundle === 1) {
                                    partBundle = req(prefix + part + '/' + suffix);
                                }
                                mixin(value, partBundle);
                            }

                            //All done, notify the loader.
                            onLoad(value);
                        });
                    });
                }
            }
        };
    });
}());

define('nls/locale',{
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
/* config file */

define('config',['require'],function($) {	
	return {
//		"root": "http://localhost/easeBookmarklet/webapp/"			// Root url path for local
//		"root": "http://dvdsie54.intranet-paris.francetelecom.fr/Sylvain/webapp-build" 		// Root url path for test
		"root": "http://accesscode.fr/webapp-build"

		,"version": "0.000b"	// Change version to avoid browser cache
	};
});
/**
 * Adapted from the official plugin text.js
 *
 * Uses UnderscoreJS micro-templates : http://documentcloud.github.com/underscore/#template
 * @author Julien Cabanès <julien@zeeagency.com>
 * @version 0.2
 * 
 * @license RequireJS text 0.24.0 Copyright (c) 2010-2011, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/jrburke/requirejs for details
 */
/*jslint regexp: false, nomen: false, plusplus: false, strict: false */
/*global require: false, XMLHttpRequest: false, ActiveXObject: false,
  define: false, window: false, process: false, Packages: false,
  java: false */

(function () {
	var progIds = ['Msxml2.XMLHTTP', 'Microsoft.XMLHTTP', 'Msxml2.XMLHTTP.4.0'],
	
		xmlRegExp = /^\s*<\?xml(\s)+version=[\'\"](\d)*.(\d)*[\'\"](\s)*\?>/im,
		
		bodyRegExp = /<body[^>]*>\s*([\s\S]+)\s*<\/body>/im,
		
		buildMap = [],
		
		templateSettings = {
			evaluate	: /<%([\s\S]+?)%>/g,
			interpolate : /<%=([\s\S]+?)%>/g
		},

		/**
		 * JavaScript micro-templating, similar to John Resig's implementation.
		 * Underscore templating handles arbitrary delimiters, preserves whitespace,
		 * and correctly escapes quotes within interpolated code.
		 */
		template = function(str, data) {
			var c  = templateSettings;
			var tmpl = 'var __p=[],print=function(){__p.push.apply(__p,arguments);};' +
				'with(obj||{}){__p.push(\'' +
				str.replace(/\\/g, '\\\\')
					.replace(/'/g, "\\'")
					.replace(c.interpolate, function(match, code) {
					return "'," + code.replace(/\\'/g, "'") + ",'";
					})
					.replace(c.evaluate || null, function(match, code) {
					return "');" + code.replace(/\\'/g, "'")
										.replace(/[\r\n\t]/g, ' ') + "; __p.push('";
					})
					.replace(/\r/g, '')
					.replace(/\n/g, '')
					.replace(/\t/g, '')
					+ "');}return __p.join('');";
			return tmpl;
			
			/** /
			var func = new Function('obj', tmpl);
			return data ? func(data) : func;
			/**/
		};

	define('tpl',[],function () {
		var tpl;

		var get, fs;
		if (typeof window !== "undefined" && window.navigator && window.document) {
			get = function (url, callback) {				
				var xhr = tpl.createXhr();
				xhr.open('GET', url, true);
				xhr.onreadystatechange = function (evt) {
					//Do not explicitly handle errors, those should be
					//visible via console output in the browser.
					if (xhr.readyState === 4) {
						callback(xhr.responseText);
					}
				};
				xhr.send(null);
			};
		} else if (typeof process !== "undefined" &&
 				process.versions &&
 				!!process.versions.node) {
			//Using special require.nodeRequire, something added by r.js.
			fs = require.nodeRequire('fs');

			get = function (url, callback) {
				
				callback(fs.readFileSync(url, 'utf8'));
			};
		}
		return tpl = {
			version: '0.24.0',
			strip: function (content) {
				//Strips <?xml ...?> declarations so that external SVG and XML
				//documents can be added to a document without worry. Also, if the string
				//is an HTML document, only the part inside the body tag is returned.
				if (content) {
					content = content.replace(xmlRegExp, "");
					var matches = content.match(bodyRegExp);
					if (matches) {
						content = matches[1];
					}
				} else {
					content = "";
				}
				
				return content;
			},

			jsEscape: function (content) {
				return content.replace(/(['\\])/g, '\\$1')
					.replace(/[\f]/g, "\\f")
					.replace(/[\b]/g, "\\b")
					.replace(/[\n]/g, "")
					.replace(/[\t]/g, "")
					.replace(/[\r]/g, "");
			},

			createXhr: function () {
				//Would love to dump the ActiveX crap in here. Need IE 6 to die first.
				var xhr, i, progId;
				if (typeof XMLHttpRequest !== "undefined") {
					return new XMLHttpRequest();
				} else {
					for (i = 0; i < 3; i++) {
						progId = progIds[i];
						try {
							xhr = new ActiveXObject(progId);
						} catch (e) {}

						if (xhr) {
							progIds = [progId];  // so faster next time
							break;
						}
					}
				}

				if (!xhr) {
					throw new Error("require.getXhr(): XMLHttpRequest not available");
				}

				return xhr;
			},

			get: get,

			load: function (name, req, onLoad, config) {
				
				//Name has format: some.module.filext!strip
				//The strip part is optional.
				//if strip is present, then that means only get the string contents
				//inside a body tag in an HTML string. For XML/SVG content it means
				//removing the <?xml ...?> declarations so the content can be inserted
				//into the current doc without problems.

				var strip = false, url, index = name.indexOf("."),
					modName = name.substring(0, index),
					ext = name.substring(index + 1, name.length);

				index = ext.indexOf("!");
				
				if (index !== -1) {
					//Pull off the strip arg.
					strip = ext.substring(index + 1, ext.length);
					strip = strip === "strip";
					ext = ext.substring(0, index);
				}

				//Load the tpl.
				url = 'nameToUrl' in req ? req.nameToUrl(modName, "." + ext) : req.toUrl(modName + "." + ext);
				
				tpl.get(url, function (content) {
					content = template(content);
					
					if(!config.isBuild) {
					//if(typeof window !== "undefined" && window.navigator && window.document) {
						content = new Function('obj', content);
					}
					content = strip ? tpl.strip(content) : content;
					
					if (config.isBuild && config.inlineText) {
						buildMap[name] = content;
					}
					onLoad(content);
				});

			},

			write: function (pluginName, moduleName, write) {
				if (moduleName in buildMap) {
					var content = tpl.jsEscape(buildMap[moduleName]);
					write("define('" + pluginName + "!" + moduleName  +
  						"', function() {return function(obj) { " +
  							content.replace(/(\\')/g, "'").replace(/(\\\\)/g, "\\")+
  						"}});\n");
				}
			}
		};
		return function() {};	
	});
//>>excludeEnd('excludeTpl')
}());

define('tpl!tools/autoAudit/main.tpl', function() {return function(obj) { var __p=[],print=function(){__p.push.apply(__p,arguments);};with(obj||{}){__p.push('<div class="scrollbar"><div class="track"><div class="thumb"><div class="end"></div></div></div></div><div class="viewport"><div class="overview"><!-- resume --><div>',resume,'</div><br><!-- page title --><div class="easeBM_autoAuditTitle">',locale.autoAudit.general,'</div><div class="easeBM_paragraph">',pageTitle,'</div><!-- Frame --><div class="easeBM_autoAuditTitle">',locale.autoAudit.frameTitle,'</div><div class="easeBM_paragraph">',frames,'</div><!-- headings --><div class="easeBM_autoAuditTitle">',locale.autoAudit.headingsTitle,'</div><div class="easeBM_paragraph">',headings,'</div><!-- inline styles --><div class="easeBM_autoAuditTitle">',locale.autoAudit.inlineStyleTitle,'</div><div class="easeBM_paragraph">',inlineStyle,'</div><!-- language --><div class="easeBM_autoAuditTitle">',locale.autoAudit.languageTitle,'</div><div class="easeBM_paragraph">',language,'</div><!-- images --><div class="easeBM_autoAuditTitle">',locale.autoAudit.imageTitle,'</div><div class="easeBM_paragraph">',image,'</div><!-- tables --><div class="easeBM_autoAuditTitle">',locale.autoAudit.tableTitle,'</div><div class="easeBM_paragraph">',table,'</div><!-- forms --><div class="easeBM_autoAuditTitle">',locale.autoAudit.formTitle,'</div><div class="easeBM_paragraph">',form,'</div></div></div>');}return __p.join('');}});

/* tools functions */

define('common/tools.js',["jquery"], function($) {		
	return {
		"templateSettings": {
			evaluate	: /<%([\s\S]+?)%>/g,
			interpolate : /<%=([\s\S]+?)%>/g
		}

		/**
		 * JavaScript micro-templating, similar to John Resig's implementation.
		 * Underscore templating handles arbitrary delimiters, preserves whitespace,
		 * and correctly escapes quotes within interpolated code.
		 */			
		,"tmpl": function(str, data) {						
			var c  = this.templateSettings;
			var tmpl = 'var __p=[],print=function(){__p.push.apply(__p,arguments);};' +
				'with(obj||{}){__p.push(\'' +
				str.replace(/\\/g, '\\\\')
					.replace(/'/g, "\\'")
					.replace(c.interpolate, function(match, code) {
					return "'," + code.replace(/\\'/g, "'") + ",'";
					})
					.replace(c.evaluate || null, function(match, code) {
					return "');" + "print("+code.replace(/\\'/g, "'")+")"
										.replace(/[\r\n\t]/g, ' ')+ "; __p.push('";
					})
					.replace(/\r/g, '')
					.replace(/\n/g, '')
					.replace(/\t/g, '')
					+ "');}return __p.join('');";
			return tmpl;
		}

		,"tpl": function(str) {			
			return new Function('obj', this.tmpl(str));
		}

		// Compute number of rows/coluns in a table
		,getTableLength: function(table) {			
		    var colCount = 0;
		    table.find('tr:nth-child(1) td, tr:nth-child(1) th').each(function () {
		    	if ($(this).attr('colspan')) {
		            colCount += +$(this).attr('colspan');
		        } else {
		            colCount++;
		        }
		    });			

		    var id = new Date().valueOf();
		    var backupId = table.attr("id");
		    table.attr("id", id);
			var rowCount = $("#"+id+" tr").length;
			table.attr("id", backupId);
		    return {"cols": colCount, "rows": rowCount}
		}		
	};
});
define('tpl!tools/autoAudit/export.tpl', function() {return function(obj) { var __p=[],print=function(){__p.push.apply(__p,arguments);};with(obj||{}){__p.push('<!DOCTYPE html><html><head><title>', locale.autoAudit.exportTitle ,'</title><link href="', config.root ,'/tools/autoAudit/exportStyle.css?', config.version ,'" type="text/css" rel="stylesheet"></head><body></body></html>');}return __p.join('');}});

define('tpl!tools/inspector/main.tpl', function() {return function(obj) { var __p=[],print=function(){__p.push.apply(__p,arguments);};with(obj||{}){__p.push('<div class="easeBM_pageContent"><!-- column 1 --><div class="easeBM_column"><!-- type list --><select multiple="multiple" id="easeBM_inspectorTypeSelect"><option selected="selected" value="all">',locale.inspector.all,'</option><option value="lang">',locale.inspector.lang,'</option><option value="header">',locale.inspector.header,'</option><option value="inlineStyle">',locale.inspector.inlineStyle,'</option><option value="list">',locale.inspector.list,'</option><option value="form">',locale.inspector.form,'</option><option value="table">',locale.inspector.table,'</option><option value="image">',locale.inspector.image,'</option><option value="link">',locale.inspector.link,'</option><option value="role">',locale.inspector.role,'</option><option value="html5">',locale.inspector.html5,'</option><option value="frame">',locale.inspector.frame,'</option></select></div><!-- column 2 --><div class="easeBM_column"><!-- element list --><select multiple="multiple" id="easeBM_inspectorElementSelect"></select></div><!-- column 3 --><div class="easeBM_column"><div class="easeBM_toolbar"><!-- display HTML button --><button aria-checked="true" role="checkbox" id="easeBM_inspectorDisplayButton" title="',locale.inspector.displayOnPageTitle,'" class="easeBM_OrangeButton">',locale.inspector.displayOnPage,'</button><!-- export button --><button id="easeBM_inspectorExportButton" class="easeBM_OrangeButton grey">',locale.inspector.exportButton,'</button><!-- back button --><button id="easeBM_inspectorBackButton" class="easeBM_OrangeButton grey">',locale.inspector.backButton,'</button></div></div></div>');}return __p.join('');}});

define('tpl!tools/inspector/export.tpl', function() {return function(obj) { var __p=[],print=function(){__p.push.apply(__p,arguments);};with(obj||{}){__p.push('<!DOCTYPE html><html><head><title>', locale.inspector.exportTitle ,'</title><link href="', config.root ,'/tools/inspector/exportStyle.css?', config.version ,'" type="text/css" rel="stylesheet"></head><body></body></html>');}return __p.join('');}});

/* inspector tool */
define('tools/inspector/inspector',["jquery", "i18n!nls/locale", "tpl!tools/inspector/main.tpl", "tpl!tools/inspector/export.tpl", "common/tools", "config"], function($, locale, mainTpl, exportTpl, tools, config) {	
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
/* inspector tool */
define('tools/autoAudit/autoAudit',["jquery", "i18n!nls/locale", "config", "tpl!tools/autoAudit/main.tpl", "common/tools", "tpl!tools/autoAudit/export.tpl", "tools/inspector/inspector"], function($, locale, config, mainTpl, tools, exportTpl, inspector) {	
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
define('tpl!tools/alternatives/alternatives.tpl', function() {return function(obj) { var __p=[],print=function(){__p.push.apply(__p,arguments);};with(obj||{}){__p.push('<!DOCTYPE html><html><head><title>', locale.alternative.title ,'</title><link href="', config.root ,'/tools/alternatives/style.css?', config.version ,'" type="text/css" rel="stylesheet"></head><body class="typeValid typeError typeEmpty"><div class="header hGrad"><!-- radio button : "All" --><input type="radio" id="rAll" name="view" value="all" checked="checked"><label id="rAllLabel" tabindex="0" for="rAll"></label><!-- radio button : "Error" --><input type="radio" id="rError" name="view" value="error"><label id="rErrorLabel" tabindex="0" for="rError"></label><!-- radio button : "Empty" --><input type="radio" id="rEmpty" name="view" value="empty"><label id="rEmptyLabel" tabindex="0" for="rEmpty"></label><!-- radio button : "Valid" --><input type="radio" id="rValid" name="view" value="valid"><label id="rValidLabel" tabindex="0" for="rValid"></label><span id="details"></span></div></body></html>');}return __p.join('');}});

define('tpl!tools/alternatives/item.tpl', function() {return function(obj) { var __p=[],print=function(){__p.push.apply(__p,arguments);};with(obj||{}){__p.push('<div class="container ', state ,'"><div class="info">', element ,'</div><div class="element"><span class="', state ,'"><a href="javascript:">', label ,'</a></span><br>', img ,'<br><br></div><input type="button" value="', locale.alternative.infoButton ,'" class="infoButton miniButton"><input type="button" value="', locale.alternative.findButton ,'" class="findButton miniButton"></div>');}return __p.join('');}});

/* alternative tool */
define('tools/alternatives/alternatives',["jquery", "i18n!nls/locale", "tpl!tools/alternatives/alternatives.tpl", "tpl!tools/alternatives/item.tpl", "config"], function($, locale, mainTpl, itemTpl, config) {	
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
define('tpl!tools/screenReaderViewTool/main.tpl', function() {return function(obj) { var __p=[],print=function(){__p.push.apply(__p,arguments);};with(obj||{}){__p.push('<div class="header hGrad"><!-- radio button : input list --><a id="formButton" href="#">champs de formulaire</a><a id="headerButton" href="#">balises de titre</a><a id="linkButton" href="#">liste des liens</a></div><div class="easeBM_CONTAINER">', html ,'</div><div class="easeBM_listContainer"></div>');}return __p.join('');}});

define('tpl!tools/screenReaderViewTool/popup.tpl', function() {return function(obj) { var __p=[],print=function(){__p.push.apply(__p,arguments);};with(obj||{}){__p.push('<div tabindex="0" class="easeBM_list ', className ,'">  <div tabindex="0" class="title">', title ,'</div>  <div class="easeBM_listContent">    <select multiple="multiple">      ', itemList ,'    </select>  </div>  <div class="toolbar">    <button>fermer</button>  </div>  <div tabindex="0" class="focusBlocker"></div></div>');}return __p.join('');}});

/* alternative tool */
define('tools/screenReaderViewTool/screenReaderViewTool',["jquery", "i18n!nls/locale", "config", "tpl!tools/screenReaderViewTool/main.tpl", "tpl!tools/screenReaderViewTool/popup.tpl", "common/tools.js"], function($, locale, config, mainTemplate, popupTpl, tools) {	
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
define('tpl!menu/rateWidget/rateWidget.tpl', function() {return function(obj) { var __p=[],print=function(){__p.push.apply(__p,arguments);};with(obj||{}){__p.push('<!-- rate --><div class="easeBM_rateWidget_rate">0%</div><!-- vertical bar --><div class="easeBM_rateWidget_bar"><div><div></div></div></div><!-- caption --><div class="easeBM_rateWidget_caption"><span>100%</span><span>50%</span><span>0%</span></div>');}return __p.join('');}});

/* rate widget jquery plugin */

define('menu/rateWidget/rateWidget',["jquery", "tpl!menu/rateWidget/rateWidget.tpl"], function($, tpl) {		
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
/* menu */

define('menu/menu',["i18n!nls/locale", "jquery", "tools/autoAudit/autoAudit", "tools/alternatives/alternatives", "tools/inspector/inspector", "tools/screenReaderViewTool/screenReaderViewTool", "menu/rateWidget/rateWidget"], function(locale, $, autoAuditTool, altTool, inspector, screenReaderViewTool, rateWidget) {	
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
define('tpl!menu/menu.tpl', function() {return function(obj) { var __p=[],print=function(){__p.push.apply(__p,arguments);};with(obj||{}){__p.push('<!-- Header menu --><div><ul><li id="easeBM_MenuItemFor_audit">',locale.menu.auditItem,'</li><li id="easeBM_MenuItemFor_tools">',locale.menu.toolsItem,'</li><li id="easeBM_MenuItemFor_settings">',locale.menu.configItem,'</li><li id="easeBM_MenuItemFor_help">',locale.menu.helpItem,'</li><li id="easeBM_MenuItemFor_about">',locale.menu.aboutItem,'</li></ul></div><!-- Pages --><div><!-- audit --><div id="easeBM_auditSection"><!-- audit main page --><div id="easeBM_auditHome" class="easeBM_simplePage easeBM_page"><span>',locale.menu.audit.auto,'</span><div><button id="easeBM_auditStartButton" class="easeBM_OrangeButton">',locale.menu.audit.autoButton,'</button></div></div><!-- auto audit tool page --><div id="easeBM_autoAudit"><div class="easeBM_pageContent"><div id="easeBM_autoAuditContent" class="easeBM_scrollbar" tabindex="0"></div><div class="easeBM_toolbar"><button id="easeBM_autoAuditBackButton" class="easeBM_OrangeButton grey">',locale.autoAudit.back,'</button><button id="easeBM_autoAuditExportButton" class="easeBM_OrangeButton grey">',locale.autoAudit.exportButton,'</button></div></div></div></div><!-- Tools menu --><div id="easeBM_toolsSection"><!-- Tools home page --><div id="easeBM_toolsHome"><ul><li><a id="easeBM_altToolLink">',locale.menu.tools.alternativeText,'</a></li><li><a id="easeBM_inspectorLink">',locale.menu.tools.inspector,'</a></li><li><a id="easeBM_screenReaderView">',locale.menu.tools.screenReaderView,'</a></li><li><a title="',locale.menu.tools.enableJqueryTip,'" id="easeBM_jqueryEnabler">',locale.menu.tools.enableJquery,'</a></li><li><a title="',locale.menu.tools.enableConfortTip,'" id="easeBM_confortEnabler">',locale.menu.tools.enableConfort,'</a></li></ul></div><!-- alternative page --><div id="easeBM_toolsAlternative"><div class="easeBM_pageContent"><!-- rate widget --><div id="easeBM_altRateWidget"></div><div class="easeBM_pageMessage"><span>',locale.menu.alternative.title,'</span><button id="easeBM_altRestartButton" class="easeBM_OrangeButton">',locale.menu.alternative.restart,'</button><button id="easeBM_altBackButton" class="easeBM_OrangeButton grey">',locale.menu.alternative.back,'</button></div></div></div><!-- inspector tool page --><div id="easeBM_inspector"></div></div><!-- settings --><div id="easeBM_settingsSection"><!-- settings page 1 --><div class="easeBM_simplePage"><span>',locale.menu.settings.fontSize,' (',fontSize,'%)</span><div class="easeBM_buttons"><button id="easeBM_setDownBtn" class="easeBM_OrangeButton grey">',locale.menu.settings.decreaseFontSize,'</button><button id="easeBM_setUpBtn" class="easeBM_OrangeButton grey">',locale.menu.settings.increaseFontSize,'</button></div></div></div><!-- help menu --><div id="easeBM_helpSection"><!-- help page 1 --><div class="easeBM_simplePage"><div>',locale.menu.help.shortcuts,'</div>    ',locale.menu.help.navigation,'<br>    ',locale.menu.help.showHide,'<br>    ',locale.menu.help.increaseDecreaseFontSize,'<br><div>',locale.menu.help.links,'</div>    <a href="',locale.menu.help.WCAG2Link,'">',locale.menu.help.WCAG2LinkLabel,'</a></div></div><!-- about menu --><div id="easeBM_aboutSection"><div class="easeBM_simplePage"><span>',locale.menu.about.title,'</span><br>',locale.menu.about.version,': ',config.version,'</div></div></div><span id="easeBM_endMenu"></span>');}return __p.join('');}});

/*
 * Tiny Scrollbar
 * http://www.baijs.nl/tinyscrollbar/
 *
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.opensource.org/licenses/gpl-2.0.php
 *
 * Date: 13 / 08 / 2012
 * @version 1.81
 * @author Maarten Baijs
 *
 */
//;( function( $ ) 
define('vendor/jquery.tinyscrollbar',["jquery"], function($) {       

    $.tiny = $.tiny || { };

    $.tiny.scrollbar = {
        options: {
                axis         : 'y'    // vertical or horizontal scrollbar? ( x || y ).
            ,   wheel        : 40     // how many pixels must the mouswheel scroll at a time.
            ,   scroll       : true   // enable or disable the mousewheel.
            ,   lockscroll   : true   // return scrollwheel to browser if there is no more content.
            ,   size         : 'auto' // set the size of the scrollbar to auto or a fixed number.
            ,   sizethumb    : 'auto' // set the size of the thumb to auto or a fixed number.
            ,   invertscroll : false  // Enable mobile invert style scrolling
        }
    };

    $.fn.tinyscrollbar = function( params )
    {
        var options = $.extend( {}, $.tiny.scrollbar.options, params );
        
        this.each( function()
        { 
            $( this ).data('tsb', new Scrollbar( $( this ), options ) ); 
        });

        return this;
    };

    $.fn.tinyscrollbar_update = function(sScroll)
    {
        if($( this ).data( 'tsb' )) {
            return $( this ).data( 'tsb' ).update( sScroll ); 
        }
        return $(this);
    };

    function Scrollbar( root, options )
    {
        var oSelf       = this
        ,   oWrapper    = root
        ,   oViewport   = { obj: $( '.viewport', root ) }
        ,   oContent    = { obj: $( '.overview', root ) }
        ,   oScrollbar  = { obj: $( '.scrollbar', root ) }
        ,   oTrack      = { obj: $( '.track', oScrollbar.obj ) }
        ,   oThumb      = { obj: $( '.thumb', oScrollbar.obj ) }
        ,   sAxis       = options.axis === 'x'
        ,   sDirection  = sAxis ? 'left' : 'top'
        ,   sSize       = sAxis ? 'Width' : 'Height'
        ,   iScroll     = 0
        ,   iPosition   = { start: 0, now: 0 }
        ,   iMouse      = {}
        ,   touchEvents = 'ontouchstart' in document.documentElement
        ;

        function initialize()
        {
            oSelf.update();
            setEvents();

            return oSelf;
        }

        this.update = function( sScroll )
        {
            oViewport[ options.axis ] = oViewport.obj[0][ 'offset'+ sSize ];
            oContent[ options.axis ]  = oContent.obj[0][ 'scroll'+ sSize ];
            oContent.ratio            = oViewport[ options.axis ] / oContent[ options.axis ];

            oScrollbar.obj.toggleClass( 'disable', oContent.ratio >= 1 );

            oTrack[ options.axis ] = options.size === 'auto' ? oViewport[ options.axis ] : options.size;
            oThumb[ options.axis ] = Math.min( oTrack[ options.axis ], Math.max( 0, ( options.sizethumb === 'auto' ? ( oTrack[ options.axis ] * oContent.ratio ) : options.sizethumb ) ) );
        
            oScrollbar.ratio = options.sizethumb === 'auto' ? ( oContent[ options.axis ] / oTrack[ options.axis ] ) : ( oContent[ options.axis ] - oViewport[ options.axis ] ) / ( oTrack[ options.axis ] - oThumb[ options.axis ] );
            
            iScroll = ( sScroll === 'relative' && oContent.ratio <= 1 ) ? Math.min( ( oContent[ options.axis ] - oViewport[ options.axis ] ), Math.max( 0, iScroll )) : 0;
            iScroll = ( sScroll === 'bottom' && oContent.ratio <= 1 ) ? ( oContent[ options.axis ] - oViewport[ options.axis ] ) : isNaN( parseInt( sScroll, 10 ) ) ? iScroll : parseInt( sScroll, 10 );
            
            setSize();
        };

        function setSize()
        {
            var sCssSize = sSize.toLowerCase();

            oThumb.obj.css( sDirection, iScroll / oScrollbar.ratio );
            oContent.obj.css( sDirection, -iScroll );
            iMouse.start = oThumb.obj.offset()[ sDirection ];

            oScrollbar.obj.css( sCssSize, oTrack[ options.axis ] );
            oTrack.obj.css( sCssSize, oTrack[ options.axis ] );
            oThumb.obj.css( sCssSize, oThumb[ options.axis ] );
        }

        function setEvents()
        {
            if( ! touchEvents )
            {
                oThumb.obj.bind( 'mousedown', start );
                oTrack.obj.bind( 'mouseup', drag );
            }
            else
            {
                oViewport.obj[0].ontouchstart = function( event )
                {   
                    if( 1 === event.touches.length )
                    {
                        start( event.touches[ 0 ] );
                        event.stopPropagation();
                    }
                };
            }

            if( options.scroll && window.addEventListener )
            {
                oWrapper[0].addEventListener( 'DOMMouseScroll', wheel, false );
                oWrapper[0].addEventListener( 'mousewheel', wheel, false );
                oWrapper[0].addEventListener( 'MozMousePixelScroll', function( event ){
                    event.preventDefault();
                }, false);
                oWrapper[0].addEventListener( 'keydown', keyboard, false );
            }
            else if( options.scroll )
            {
                oWrapper[0].onmousewheel = wheel;
            }
        }

        function start( event )
        {
            $( "body" ).addClass( "noSelect" );

            var oThumbDir   = parseInt( oThumb.obj.css( sDirection ), 10 );
            iMouse.start    = sAxis ? event.pageX : event.pageY;
            iPosition.start = oThumbDir == 'auto' ? 0 : oThumbDir;
            
            if( ! touchEvents )
            {
                $( document ).bind( 'mousemove', drag );
                $( document ).bind( 'mouseup', end );
                oThumb.obj.bind( 'mouseup', end );
            }
            else
            {
                document.ontouchmove = function( event )
                {
                    event.preventDefault();
                    drag( event.touches[ 0 ] );
                };
                document.ontouchend = end;        
            }
        }

        function wheel( event )
        {
            if( oContent.ratio < 1 )
            {
                var oEvent = event || window.event
                ,   iDelta = oEvent.wheelDelta ? oEvent.wheelDelta / 120 : -oEvent.detail / 3
                ;

                iScroll -= iDelta * options.wheel;
                iScroll = Math.min( ( oContent[ options.axis ] - oViewport[ options.axis ] ), Math.max( 0, iScroll ));

                oThumb.obj.css( sDirection, iScroll / oScrollbar.ratio );
                oContent.obj.css( sDirection, -iScroll );

                if( options.lockscroll || ( iScroll !== ( oContent[ options.axis ] - oViewport[ options.axis ] ) && iScroll !== 0 ) )
                {
                    oEvent = $.event.fix( oEvent );
                    oEvent.preventDefault();
                }
            }
        }

        // Add keyboard navigation
        function keyboard(event){
             if (oContent.ratio < 1) {

                var oEvent = event || window.event

                // Up arrow
                if (event.keyCode == 38) {
                    iDelta = 1;
                // Down arrow
                } else if (event.keyCode == 40) {
                    iDelta = -1;
                } else {
                    return;
                }

                iScroll -= iDelta * options.wheel;
                iScroll = Math.min( ( oContent[ options.axis ] - oViewport[ options.axis ] ), Math.max( 0, iScroll ));

                oThumb.obj.css( sDirection, iScroll / oScrollbar.ratio );
                oContent.obj.css( sDirection, -iScroll );

                oEvent = $.event.fix(oEvent);
                oEvent.preventDefault();
            }
        }

        function drag( event )
        {
            if( oContent.ratio < 1 )
            {
                if( options.invertscroll && touchEvents )
                {
                    iPosition.now = Math.min( ( oTrack[ options.axis ] - oThumb[ options.axis ] ), Math.max( 0, ( iPosition.start + ( iMouse.start - ( sAxis ? event.pageX : event.pageY ) ))));
                }
                else
                {
                     iPosition.now = Math.min( ( oTrack[ options.axis ] - oThumb[ options.axis ] ), Math.max( 0, ( iPosition.start + ( ( sAxis ? event.pageX : event.pageY ) - iMouse.start))));
                }

                iScroll = iPosition.now * oScrollbar.ratio;
                oContent.obj.css( sDirection, -iScroll );
                oThumb.obj.css( sDirection, iPosition.now );
            }
        }
        
        function end()
        {
            $( "body" ).removeClass( "noSelect" );
            $( document ).unbind( 'mousemove', drag );
            $( document ).unbind( 'mouseup', end );
            oThumb.obj.unbind( 'mouseup', end );
            document.ontouchmove = document.ontouchend = null;
        }

        return initialize();
    }

    return $.tiny;
});
//}(jQuery));
/* 	easebookMarklet module */

define('menu/easeBookmarklet',["i18n!nls/locale", "jquery", "menu/menu", "tpl!menu/menu.tpl", "config", "vendor/jquery.tinyscrollbar"], function(locale, $, menu, menuTpl, config, tinyScrollbarPlugin) {	
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

/* Main module */
require(["jquery", "menu/easeBookmarklet", "config"], function($, easeBookmarklet, config) {

	/* require JS config */
	require.config({	

		// Add time stamp to the end of files url (avoid browser cache)
		urlArgs: config.version

		// File path used by require js
	 	,paths: {
	        "jquery": "empty:",			// path to jQuery
	        "tpl": "vendor/tpl",		// path to template requireJs plugin
	        "i18n": "vendor/i18n"		// path to i18n requireJs plugin
	    }

	    //,locale: "en"		// use "en" language instead of the default browser language (uncomment to force english language)
	});

	// Set jQuery no conflict mode (avoid conflict if jquery is already used in the current page)
	$.noConflict();  

	// Start bookmaklet
	easeBookmarklet.start();
});
define("main", function(){});
