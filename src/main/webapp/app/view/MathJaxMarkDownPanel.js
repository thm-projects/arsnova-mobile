/*--------------------------------------------------------------------------+
 This file is part of ARSnova.
 - Beschreibung: Panel with Mathjax and Markdown support
 - Autor(en):    Julian Rossbach <julian.rossbach@mni.thm.de>
                 Colin Appel <colin.appel@mni.thm.de>
                 Alexander Nadler <alexander.nadler@mni.thm.de>
                 Jannik Schaaf <jannik.schaaf-2@mni.thm.de>
                 Karolina Rozanka <karolina.rozanka@mni.thm.de>
 +---------------------------------------------------------------------------+
 This program is free software; you can redistribute it and/or
 modify it under the terms of the GNU General Public License
 as published by the Free Software Foundation; either version 2
 of the License, or any later version.
 +---------------------------------------------------------------------------+
 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.
 You should have received a copy of the GNU General Public License
 along with this program; if not, write to the Free Software
 Foundation, Inc., 59 Temple Place - Suite 330, Boston, MA  02111-1307, USA.
 +--------------------------------------------------------------------------*/

Ext.define('ARSnova.view.MathJaxMarkDownPanel', {
	extend: 'Ext.Component',

	xtype: 'mathJaxMarkDownPanel',
	ui: 'normal',

	config: {
		id				 : 'content',
		title			 : 'MathJaxMarkDownPanel',
		cls				 : 'roundedBox',
		fullscreen		 : false,
		scrollable		 : {direction: 'auto'},
		styleHtmlContent : true,
		html			 : 'empty',
		style			 : 'color: black; background-color: #FFFFFF; margin-bottom: 10px'
	},

	initialize: function() {
		this.callParent(arguments);
	},

	setContent: function(content, mathJaxEnabled, markDownEnabled, mathjaxCallback) {
		var features = ARSnova.app.globalConfig.features;
		if (markDownEnabled && features.markdown) {
			// remove MathJax blocks
			var blockDelims = get_delimiter(content, "$$", "$$");
			var repl = replace_delimiter(content, blockDelims, 'MATHJAXMARKDOWNBLOCK');

	  // remove MathJax inline
	  var inlineDelims = get_delimiter(repl.content, "[[", "]]");
	  var repl2 = replace_delimiter(repl.content, inlineDelims, 'MATHJAXMARKDOWNINLINE');

			// MarkDown is enabled and content will be converted
			repl2.content = markdown.toHTML(repl2.content);

			// get back the MathJax blocks in reverse order
			repl.content = replace_back(repl2);
	  content = replace_back(repl);
		}
		this.setHtml(content);
		var callback = mathjaxCallback || Ext.emptyFn;
		if (mathJaxEnabled && features.mathJax && "undefined" !== typeof MathJax) {
			// MathJax is enabled and content will be converted
			var queue = MathJax.Hub.Queue(["Typeset", MathJax.Hub, this.element.dom]);
	  MathJax.Hub.Queue([callback, this.element.down('div')]);
		} else {
			callback(this.element.down('div'));
		}
	}
});

//get all delimiter indices as array of [start(incl), end(excl)] elements
function get_delimiter(input, delimiter, end_delimiter) {

	//all lines between the tags to this array
	var result = new Array(); //[start, end]

	var idx_start = 0;
	var idx_end = -delimiter.length;
	var run = true;

	while(run) {
		//start delimiter
		idx_start = input.indexOf(delimiter, idx_end + end_delimiter.length);

		//end delimiter
		idx_end = input.indexOf(end_delimiter, idx_start + delimiter.length);

		if(idx_start != -1 && idx_end != -1) {
			//add delimiter position values
			result.push([idx_start, idx_end + end_delimiter.length]);
		} else {
			run = false;
		}
	}
	return result;
};

//replace the delimiter with id_strN (returns an array with
//the input string including all replacements and another array with the replaced content)
function replace_delimiter(input, d_arr, id_label) {

	var result = '';

	var start = 0;

	var replaced = new Array();

	for(var i = 0; i < d_arr.length; ++i) {

		var idx_start = d_arr[i][0];
		var idx_end = d_arr[i][1];

		//until start of delimiter
		result = result + input.substring(start, idx_start);

		//set id label
		result += (id_label + i + 'X');

		//new start becomes old end
		start = idx_end;

		//store replaced content
		replaced.push(input.substring(idx_start, idx_end));
	}
	result += input.substring(start);

	return { content: result, source: replaced, label: id_label };
}

//replace the labels back to the contents and return the string
function replace_back(content_replaced) {

	var content = content_replaced.content;
	var replaced = content_replaced.source;

	for(var i = 0; i < replaced.length; ++i) {
		content = replaceWithoutRegExp(content, content_replaced.label + i + 'X', replaced[i]);
	}

	return content;
}

//replace given variable with the replacement in input without using regular expressions
function replaceWithoutRegExp(input, find, replacement) {
	return input.split(find).join(replacement);
}
