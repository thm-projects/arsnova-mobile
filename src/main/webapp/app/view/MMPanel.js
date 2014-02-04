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
Ext.define('ARSnova.view.MMPanel', {
	extend: 'Ext.Container',

	xtype: 'mm_panel',
	ui: 'normal',
	
	config: {
		fullscreen: false,
		
		title: 'Preview-Panel',
	},
	
	setQuestion: function(q) {
		this.question = q;
		
		//allow more html-tags and set content
		this.setStyleHtmlContent(true);
		this.getAt(0).setHtml(q);
	},
	
	initialize: function() {
		this.callParent(arguments);

		this.add([{
			
			id        : 'mathjax_text',
			xtype     : 'container',
			style     : 'color:red; background-color: green; margin-bottom:20px',
			scrollable: {direction: 'auto'},
			minHeight : '200px',
			minWidth  : '300px',
			html      : 'empty',
		},
		{
			xtype   : 'container',
			items   : [{
			
				xtype	: 'button',
				docked	: 'right',
				ui		: 'confirm',
				title	: 'ButtonTitle',
				style   : '',
				html    : '<b><i>OK</i></b>'
			}]
		}])
	},
	
	showPreview: function(title, question) {
		
		//var markdown = require( "markdown" ).markdown;
		question = markdown.toHTML(question);
		//MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
		//alert(MathJax.parse(question));
		
		var panel = Ext.create('ARSnova.view.MMPanel',{xtype: 'mm_panel'});

		panel.setQuestion(question);
		
		var box = Ext.create('Ext.MessageBox',
        {
			id: 'message-box',
            items: [panel],
            scope: this
        });
		box.setTitle(title);
		panel.getAt(1).getAt(0).setHandler(function() {box.destroy();});
		
		MathJax.Hub.Queue(["Typeset", MathJax.Hub, panel.getAt(0).element.dom]);
		
		box.show();
		
		MathJax.Hub.Queue(["Typeset", MathJax.Hub, panel.getAt(0).element.dom]);
	}
});