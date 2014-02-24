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

Ext.define('ARSnova.view.QuestionPreviewBox', {

	xtype: 'questionPreview',
	ui: 'normal',
	
	showPreview: function(title, content) {
						
		// panel for question subject
		var titlePanel = Ext.create('ARSnova.view.MathJaxMarkDownPanel', {
			xtype	: 'mathJaxMarkDownPanel',
			id      : 'questionTitle'
		});
		titlePanel.setContent(title, false, true, '100px');

		// panel for question content
		var contentPanel = Ext.create('ARSnova.view.MathJaxMarkDownPanel', {
			xtype	: 'mathJaxMarkDownPanel',
			id      : 'questionContent'
		});
		contentPanel.setContent(content, true, true, '300px');
		
		// question preview confirm button
		var confirmButton = Ext.create('Ext.Button', {
			text	: Messages.QUESTION_PREVIEW_DIALOGBOX_BUTTON_TITLE,
			id      : 'confirmButton',
			xtype	: 'button',
			ui		: 'confirm',  
		   	style   : 'width: 80%; maxWidth: 250px; margin-top: 10px;',
			handler	: function() {
					previewBox.destroy();
				}
		});

		// question preview main panel
		var mainPanel = Ext.create('Ext.Container', {
			id      	: 'mainPanel',
			xtype		: 'container',
			style		: 'width: 100%; background-color: #c5ccd3;',
			fullscreen	: false,	
			items   	: [titlePanel,
			        	   contentPanel,
			        	   {id		: 'buttonLayout',
			       			xtype	: 'container',
			       			layout	: {
			       				pack: 'center',
			       				type: 'hbox'
			       			},
			       			items	: [confirmButton]}]	
		});
		mainPanel.setStyleHtmlContent(true);

		// question preview message box with main panel
		var previewBox = Ext.create('Ext.MessageBox',
        {
			title 	 : Messages.QUESTION_PREVIEW_DIALOGBOX_TITLE,
			style	 : 'width: 80%; maxWidth: 1000px; border-color: black;',
            items 	 : [mainPanel],
			scope 	 : this
        });			
		previewBox.show();
	}
});