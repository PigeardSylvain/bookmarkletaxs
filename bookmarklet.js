var w=window;d=document;
if (typeof(w.easeBookmarklet)!="undefined") {
	w.easeBookmarklet.toggleDisplay();
} else {
	(function() {
		var s = d.createElement("script");
	    s.id = "easeBookmarklet";    
	    s.src = "http://localhost/easeBookmarklet/webapp/vendor/require-jquery.js?";
	    s.setAttribute("data-main", "http://localhost/easeBookmarklet/webapp-build/main.js");
	    d.body.appendChild(s);
	})();
}


javascript:var w=window;d=document;if(typeof(w.easeBookmarklet)!="undefined"){w.easeBookmarklet.toggleDisplay()}else{(function(){var s=d.createElement("script");s.id="easeBookmarklet";s.src="http://localhost/easeBookmarklet/webapp/vendor/require-jquery.js?";s.setAttribute("data-main","http://localhost/easeBookmarklet/webapp-build/main.js");d.body.appendChild(s)})()}