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
		title: 'PreviewPanel',
	},
	
	setQuestionTitle: function(t) {
		this.getAt(0).setHtml(t);
	},
	
	setQuestionContent: function(q) {
		this.getAt(1).setHtml(q);
	},
	
	initialize: function() {
		this.callParent(arguments);
		this.add([{			
			id        : 'questionTitle',
			xtype     : 'container',
			style     : 'color: black; background-color: gray; margin-bottom: 10px',
			scrollable: {direction: 'auto'},
			minHeight : '100px',
			minWidth  : '300px',
			html      : 'empty',
		},{			
			id        : 'questionContent',
			xtype     : 'container',
			style     : 'color: black; background-color: gray; margin-bottom: 10px',
			scrollable: {direction: 'auto'},
			minHeight : '200px',
			minWidth  : '300px',
			html      : 'empty',
		},{
			xtype   : 'container',
			items   : [{			
				xtype	: 'button',
				docked	: 'right',
				ui		: 'confirm',
				title	: 'ButtonTitle',
				style   : 'width: 80px;',
				text    : Messages.QUESTION_PREVIEW_DIALOGBOX_BUTTON_TITLE
			}]
		}])
	},
	
	showPreview: function(title, content) {
		
		title = markdown.toHTML(title);
		content = markdown.toHTML(content);
		
		var panel = Ext.create('ARSnova.view.MMPanel',{xtype: 'mm_panel'});
		panel.setStyleHtmlContent(true);
		panel.setQuestionTitle(title);
		panel.setQuestionContent(content);
		panel.getAt(2).getAt(0).setHandler(function() {box.destroy();});
		
		var box = Ext.create('Ext.MessageBox',
        {
			id	  : 'message-box',
			title : Messages.QUESTION_PREVIEW_DIALOGBOX_TITLE,
            items : [panel]
        });	

		MathJax.Hub.Queue(["Typeset", MathJax.Hub, panel.getAt(0).element.dom]);
		MathJax.Hub.Queue(["Typeset", MathJax.Hub, panel.getAt(1).element.dom]);
		
		box.show();

//		MathJax.Hub.Queue(["Typeset", MathJax.Hub, panel.getAt(0).element.dom]);
//		MathJax.Hub.Queue(["Typeset", MathJax.Hub, panel.getAt(1).element.dom]);
	}
});