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