/*
 * This file is part of ARSnova Mobile.
 * Copyright (C) 2011-2012 Christian Thomas Weber
 * Copyright (C) 2012-2014 The ARSnova Team
 *
 * ARSnova Mobile is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * ARSnova Mobile is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with ARSnova Mobile.  If not, see <http://www.gnu.org/licenses/>.
 */

Ext.define('ARSnova.view.QuestionPreviewBox', {
	extend: 'Ext.MessageBox',
	
	config: {
		scrollable: true,
		hideOnMaskTap: true,
		layout: 'vbox'
	},
	
	initialize: function(args) {
		this.callParent(args);
		
		this.setStyle({
			'font-size': '110%',
			'border-color': 'black',
			'maxHeight': '600px',
			'maxWidth': '1000px',
			'margin-bottom': '18px',
			'height': '79%',
			'width': '95%'
		});
		
		this.toolbar = Ext.create('Ext.Toolbar', {
			title: Messages.QUESTION_PREVIEW_DIALOGBOX_TITLE,
			docked: 'top',
			ui: 'light',
			items: [{
				xtype: 'button',
				iconCls: 'icon-close',
				handler: this.hide,
				scope: this,
				style: {
					'height': '36px',
					'font-size': '0.9em',
					'padding': '0 0.4em'
				}
			}]
		
		});
		
		// panel for question subject
		this.titlePanel = Ext.create('ARSnova.view.MathJaxMarkDownPanel', {
			style: 'min-height: 50px'
		});
		
		// panel for question content
		this.contentPanel = Ext.create('ARSnova.view.MathJaxMarkDownPanel', { 
			style: 'min-height: 150px'
		});
		
		// question preview confirm button
		this.confirmButton = Ext.create('Ext.Container', {
			layout: {
				pack: 'center',
				type: 'hbox'
			},
			items: [
				Ext.create('Ext.Button', {
					text: Messages.QUESTION_PREVIEW_DIALOGBOX_BUTTON_TITLE,
					ui: 'confirm',
					style: 'width: 80%; maxWidth: 250px; margin-top: 10px;',
					scope: this,
					handler: function () {
						this.hide();
					}
				})
			]
		});
		
		// answer preview box content panel
		this.mainPanel = Ext.create('Ext.Container', {
			layout: 'vbox',
			style: 'margin-bottom: 10px;',
			styleHtmlContent: true,
			items: [
				this.titlePanel,
				this.contentPanel,
				this.confirmButton
			]
		});
		
		// remove padding around mainPanel
		this.mainPanel.bodyElement.dom.style.padding="0";
		
		this.on('hide', this.destroy);
	},

	showPreview: function (title, content) {		
		this.titlePanel.setContent(title.replace(/\./, "\\."), false, true);
		this.contentPanel.setContent(content, true, true);
		
		this.add([
			this.toolbar,
			this.mainPanel
		]);
		
		this.show();

		// for IE: unblock input fields
		Ext.util.InputBlocker.unblockInputs();
	}
});
