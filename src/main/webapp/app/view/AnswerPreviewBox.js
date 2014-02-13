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
		
		var previewBoxTitle;
		var previewBoxContent;
		
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
		
		if (answers.length == 1) {
			
			// SINGLE ANSWER 
			previewBoxTitle = Messages.ANSWER_PREVIEW_DIALOGBOX_TITLE_SINGLE;
			
			var item = Ext.create('ARSnova.view.MathJaxMarkDownPanel', {
				xtype	: 'mathJaxMarkDownPanel',
				id      : 'answerPanel',
				});
			item.setContent(answers[0].text, true, true);
			
			// answer preview box content panel
			previewBoxContent = Ext.create('Ext.Container', {
				id      	: 'mainPanel',
				xtype		: 'container',
				fullscreen	: false,	
				items   	: [item,
				        	   confirmButton]
			});
			previewBoxContent.setStyleHtmlContent(true);
			
		} else {
			
			// MULTIPLE ANSWER 
			previewBoxTitle = Messages.ANSWER_PREVIEW_DIALOGBOX_TITLE_MULTI;
		
			// carousel for displaying the mathJaxMarkDownPanels
			var carousel = Ext.create('Ext.Carousel', {
				width	 : '100%',
				height   : '400px',
				width    : '300px',
				style	 : 'margin-bottom: 10px;',
				flex	 : '1',
				layout	 : 'fit',
				defaults : {
					styleHtmlContent : true
				}
			});		
			
			// loop through given answers, wrap them into a temporary panel and add them to the carousel
			for (var i = 0; i <= answers.length - 1; i++) {
				var item = Ext.create('ARSnova.view.MathJaxMarkDownPanel', {
					xtype	: 'mathJaxMarkDownPanel',
					id      : 'answer-' + i,
					});
				item.setContent(answers[i].text, true, true);
				carousel.add(item);	
			}	
			
			// answer preview box content panel
			previewBoxContent = Ext.create('Ext.Container', {
				id      	: 'mainPanel',
				xtype		: 'container',
				fullscreen	: false,	
				items   	: [carousel,
				        	   confirmButton]
			});
			previewBoxContent.setStyleHtmlContent(true);
		}

		// answer preview message box with main panel
		var previewBox = Ext.create('Ext.MessageBox',
        {
			title : previewBoxTitle,
            items : [{
    			id      : 'previewBox',
    			xtype   : 'container',
    			items   : [previewBoxContent]
    		}],
			scope : this
        });			
		previewBox.show();
	}
});