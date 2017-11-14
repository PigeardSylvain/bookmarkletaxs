/* tools functions */

define(["jquery"], function($) {		
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