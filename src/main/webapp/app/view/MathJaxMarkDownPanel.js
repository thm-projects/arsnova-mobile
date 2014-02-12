/*--------------------------------------------------------------------------+
 This file is part of ARSnova.
 - Beschreibung: Panel with Mathjax and Markdown support
 - Autor(en):    Group 3...
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
	extend: 'Ext.Container',

	xtype: 'mathJaxMarkDownPanel',
	ui: 'normal',
	
	config: {
		id        	: 'content',
		title		: 'MathJaxMarkDownPanel',
		fullscreen	: false,		
		scrollable	: {direction: 'auto'},
		minHeight 	: '100px',
		minWidth  	: '300px',
		html      	: 'empty',
		style     	: 'color: black; background-color: #FFFFFF; margin-bottom: 10px',
	},
	
	initialize: function() {
		this.callParent(arguments);
	},
	
	setContent: function(content, mathJaxEnabled, markDownEnabled) {
		if (markDownEnabled) {
			// MarkDown is enabled and content will be converted
			content = markdown.toHTML(content);
		}		
		this.setHtml(content);		
		if (markDownEnabled) {
			// MathJax is enabled and content will be converted
			MathJax.Hub.Queue(["Typeset", MathJax.Hub, this.element.dom]);			
		}
	}
});