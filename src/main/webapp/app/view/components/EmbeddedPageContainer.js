/*
 * This file is part of ARSnova Mobile.
 * Copyright (C) 2011-2012 Christian Thomas Weber
 * Copyright (C) 2012-2021 The ARSnova Team and Contributors
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

Ext.define('ARSnova.view.components.EmbeddedPageContainer', {
	extend: 'Ext.Panel',
	xtype: 'embeddedpagecontainer',

	requires: ['ARSnova.view.components.EmbeddedPage'],

	config: {
		fullscreen: true,
		height: '100%',
		width: '100%',
		activateFullscreen: false,
		tab: {
			hidden: true
		}
	},

	initialize: function () {
		this.callParent(arguments);
		var appController = ARSnova.app.getController('Application');

		this.backButton = Ext.create('Ext.Button', {
			ui: 'back',
			align: 'left',
			text: Messages.BACK,
			handler: this.backHandler,
			scope: this
		});

		this.toolbar = Ext.create('Ext.TitleBar', {
			ui: 'light',
			docked: 'top',
			title: this.config.title,
			items: [this.backButton]
		});

		this.embeddedPage = Ext.create('ARSnova.view.components.EmbeddedPage', {
			src: this.config.url
		});

		this.add(this.toolbar);

		this.on('activate', function () {
			this.add(this.embeddedPage);
		});

		if (this.getActivateFullscreen()) {
			ARSnova.app.mainTabPanel.tabPanel.getTabBar().setHidden(true);
		}

		this.onAfter('deactivate', function () {
			appController.toggleHrefPanelActive();
			ARSnova.app.mainTabPanel.tabPanel.getTabBar().setHidden(false);
		});
	},

	backHandler: function () {
		ARSnova.app.mainTabPanel.tabPanel.animateActiveItem(
			ARSnova.app.lastActiveMainTabPanel, {
			type: 'slide',
			direction: 'right',
			listeners: {
				scope: this,
				animationend: function () {
					this.destroyEmbeddedPage();
				}
			}
		});
	},

	destroyEmbeddedPage: function () {
		delete ARSnova.app.getController('Application').embeddedPage;
		this.embeddedPage.destroy();
		this.destroy();
	},

	setBackHandler: function (handler) {
		var me = this;
		var previousHandler = me.backButton.getHandler();
		// Restore previous back button handler after custom handler has been executed.
		me.backButton.setHandler(Ext.Function.createSequence(handler, function restoreHandler() {
			me.backButton.setHandler(previousHandler);
		}));
	}
});
