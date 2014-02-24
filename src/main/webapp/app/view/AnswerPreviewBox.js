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

		// answer preview message box 
		var previewBox = Ext.create('Ext.MessageBox',
        {
			title : Messages.ANSWER_PREVIEW_DIALOGBOX_TITLE,
			style : 'border-color: black; maxHeigth: 80%; maxWidth: 80%; width: 1000px; heigth: 1000px',
			scope : this
        });	
				
		// carousel for displaying the mathJaxMarkDownPanels
		var carousel = Ext.create('Ext.Carousel', {
			//cls		 : 'previewCarousel',
			style	 : 'width: 100%; height: 500px; margin-bottom: 10px;',
			flex	 : '1',
			layout	 : 'fit',
			defaults : {
				styleHtmlContent : true
			},
			listeners: {   
				activeitemchange : function() {
					var actualIndex = carousel.getActiveIndex() + 1;
					previewBox.setTitle(Messages.ANSWER_PREVIEW_DIALOGBOX_TITLE + " (" + actualIndex + "/" + answers.length + ")");
                }
            }
		});		
					
		// loop through given answers, wrap them into a temporary panel and add them to the carousel
		for (var i = 0; i <= answers.length - 1; i++) {
			var item = Ext.create('ARSnova.view.MathJaxMarkDownPanel', {
				xtype	: 'mathJaxMarkDownPanel',
				id      : 'answer-' + i,
				style	: 'margin-left: 0px; margin-right: 0px;'
			});
			item.setContent(answers[i].text, true, true);
			carousel.add(item);	
		}		
			
		// question preview confirm button
		var confirmButton = Ext.create('Ext.Button', {
			text	: Messages.QUESTION_PREVIEW_DIALOGBOX_BUTTON_TITLE,
			id      : 'confirmButton',
			xtype	: 'button',
			ui		: 'confirm',
			//cls		: 'previewButtonOK',
		   	style   : 'width: 80%; maxWidth: 250px; margin-top: 10px;',
			handler	: function() {
					previewBox.destroy();
			}
		});		
			
		// answer preview box content panel
		var mainPanel = Ext.create('Ext.Container', {
			id      	: 'mainPanel',
			xtype		: 'container',
			style		: 'width: 100%; background-color: #c5ccd3;',
			fullscreen	: false,	
			items   	: [carousel,
			        	   {id		: 'buttonLayout',
				      		xtype	: 'container',
				      		layout 	: {
				      			pack: 'center',
				      			type: 'hbox'
				      		},
				      		items	: [confirmButton]}]
		});
		mainPanel.setStyleHtmlContent(true);		
		
		// add main panel to preview box and show action
		previewBox.add(mainPanel);		
		previewBox.show();
	}
});