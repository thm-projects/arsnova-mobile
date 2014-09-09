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

	xtype: 'questionPreview',
	ui: 'normal',

	showPreview: function (title, content) {

		// panel for question subject
		var titlePanel = Ext.create('ARSnova.view.MathJaxMarkDownPanel', {
			xtype: 'mathJaxMarkDownPanel',
			id: 'questionTitle',
			flex: 1
		});
		titlePanel.setContent(title, false, true);

		// panel for question content
		var contentPanel = Ext.create('ARSnova.view.MathJaxMarkDownPanel', {
			xtype: 'mathJaxMarkDownPanel',
			id: 'questionContent',
			flex: 3
		});
		contentPanel.setContent(content, true, true);

		// question preview confirm button
		var confirmButton = Ext.create('Ext.Button', {
			text: Messages.QUESTION_PREVIEW_DIALOGBOX_BUTTON_TITLE,
			id: 'confirmButton',
			xtype: 'button',
			ui: 'confirm',
			style: 'width: 80%; maxWidth: 250px; margin-top: 10px;',
			handler: function () {
					previewBox.destroy();
				}
		});

		// question preview main panel
		var mainPanel = Ext.create('Ext.Container', {
			id: 'mainPanel',
			xtype: 'container',
			style: 'position: absolute; top: 0; right: 0; bottom: 0; left: 0; background-color: #c5ccd3;',
			fullscreen: false,
			layout: 'vbox',
			items: [
				titlePanel,
				contentPanel,
				{
					id: 'buttonLayout',
					xtype: 'container',
					layout: {
						pack: 'center',
						type: 'hbox'
					},
					items: [confirmButton]
				}
			]
		});
		mainPanel.setStyleHtmlContent(true);

		// question preview message box with main panel
		var previewBox = Ext.create('Ext.MessageBox',
		{
			title: Messages.QUESTION_PREVIEW_DIALOGBOX_TITLE,
			style: 'height: 80%; maxHeight: 600px; width: 80%; maxWidth: 1000px; border-color: black;',
			items: [mainPanel],
			scope: this
		});
		previewBox.show();

		// for IE: unblock input fields
		Ext.util.InputBlocker.unblockInputs();
	}
});
