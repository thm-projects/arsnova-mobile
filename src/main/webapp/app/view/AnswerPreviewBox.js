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

Ext.define('ARSnova.view.AnswerPreviewBox', {

	xtype: 'answerPreview',
	ui: 'normal',
	
	showPreview: function(answers) {
		
		// array with separated panel for every answer
		var answerItems = [];
		
		//loop through given answers, wrap them into a temporary panel and push them into the array
		for (var i = 0; i <= answers.length - 1; i++) {
			var item = Ext.create('ARSnova.view.MathJaxMarkDownPanel', {
				xtype	: 'mathJaxMarkDownPanel',
				id      : 'answer-' + i,
				});
			item.setContent(answers[i].text, true, true);
			answerItems.push(item)
			
		}

		// Carousel implementation for displaying formatted answers
		var carousel = Ext.create('Ext.Carousel', {
			width	 : '100%',
			height   : '300px',
			layout	 : 'fit',
			defaults : {
				styleHtmlContent : true
			}			
		});
		
		// Set the carousel's items
		carousel.setItems(answerItems);
	    carousel.setActiveItem(0);

		// question preview confirm button
		var confirmButton = Ext.create('Ext.Button', {
			text	: Messages.QUESTION_PREVIEW_DIALOGBOX_BUTTON_TITLE,
			id      : 'confirmButton',
			xtype	: 'button',
			ui		: 'confirm',
		   	style   : 'width: 100px;',
			handler	: function() {
					previewBox.destroy();
				}
			});

		// question preview main panel
		var mainPanel = Ext.create('Ext.Container', {
			id      	: 'mainPanel',
			xtype		: 'container',
			fullscreen	: false,	
			items   	: [carousel,
			        	   confirmButton]
			});
		mainPanel.setStyleHtmlContent(true);

		// question preview message box with main panel
		var previewBox = Ext.create('Ext.MessageBox',
        {
			title : Messages.ANSWER_PREVIEW_DIALOGBOX_TITLE,
            items : [{
    			id      : 'previewBox',
    			xtype   : 'container',
    			items   : [mainPanel]
    		}],
			scope : this
        });			
		previewBox.show();
	}

});