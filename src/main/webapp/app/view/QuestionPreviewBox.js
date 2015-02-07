/*
 * This file is part of ARSnova Mobile.
 * Copyright (C) 2011-2012 Christian Thomas Weber
 * Copyright (C) 2012-2015 The ARSnova Team
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
		scrollable: {
			direction: 'vertical',
			directionLock: true
		},
		hideOnMaskTap: true,
		layout: 'vbox'
	},

	initialize: function (args) {
		this.callParent(args);

		this.setStyle({
			'font-size': '110%',
			'border-color': 'black',
			'margin-bottom': '18px',
			'height': '79%',
			'width': '95%'
		});

		if (Ext.os.is.Desktop) {
			this.setMaxWidth('320px');
			this.setMaxHeight('640px');
		} else {
			this.setMaxWidth('740px');
			this.setMaxHeight('600px');
		}

		this.closeButton = Ext.create('Ext.Button', {
			iconCls: 'icon-close',
			handler: this.hide,
			scope: this,
			style: {
				'height': '36px',
				'font-size': '0.9em',
				'padding': '0 0.4em'
			}
		});

		this.toolbar = Ext.create('Ext.Toolbar', {
			title: Messages.QUESTION_PREVIEW_DIALOGBOX_TITLE,
			docked: 'top',
			ui: 'light',
			items: [this.closeButton]
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
		this.mainPanel.bodyElement.dom.style.padding = "0";

		this.on('hide', function () {
			ARSnova.app.innerScrollPanel = false;
			ARSnova.app.activePreviewPanel = false;
			this.destroy();
		});

		this.on('painted', function () {
			ARSnova.app.innerScrollPanel = this;
			ARSnova.app.activePreviewPanel = this;
		});
	},

	showPreview: function (title, content) {
		ARSnova.app.innerScrollPanel = this;
		ARSnova.app.activePreviewPanel = true;
		this.titlePanel.setContent(title.replace(/\./, "\\."), false, true);
		this.contentPanel.setContent(content, true, true);

		this.add([
			this.toolbar,
			this.mainPanel
		]);

		this.show();

		// for IE: unblock input fields
		Ext.util.InputBlocker.unblockInputs();
	},

	showEmbeddedPagePreview: function (embeddedPage) {
		var controller = ARSnova.app.getController('Application'),
			me = this;

		// remove default elements from preview
		this.remove(this.toolbar, false);
		this.remove(this.mainPanel, false);

		embeddedPage.setBackHandler(function () {
			// toggle hrefPanelActive();
			controller.toggleHrefPanelActive();

			// remove & destroy embeddedPage and delete reference
			me.remove(embeddedPage, true);
			delete controller.embeddedPage;

			// add default elements to preview
			me.add(me.toolbar);
			me.add(me.mainPanel);
		});

		// add embeddedPage to preview
		this.add(embeddedPage);
	}
});
