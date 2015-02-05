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

Ext.define('ARSnova.view.components.EmbeddedPageContainer', {
	extend: 'Ext.Panel',
	xtype: 'embeddedpagecontainer',

	requires: ['ARSnova.view.components.EmbeddedPage'],

	config: {
		fullscreen: true,
		height: '100%',
		width: '100%',
		tab: {
			hidden: true
		}
	},

	initialize: function () {
		this.callParent(arguments);
		var appController = ARSnova.app.getController('Application');

		this.backButton = Ext.create('Ext.Button', {
			ui: 'back',
			text: Messages.BACK,
			handler: this.backHandler,
			scope: this
		});

		this.toolbar = Ext.create('Ext.Toolbar', {
			ui: 'light',
			docked: 'top',
			title: this.config.title,
			items: [this.backButton]
		});

		this.add(this.toolbar);

		this.on('painted', function() {
			var url = this.config.onClickElement.href;
			this.add(Ext.create('ARSnova.view.components.EmbeddedPage', {
				src: url
			}));
		});

		this.onAfter('deactivate', function() {
			appController.toggleHrefPanelActive();
		});

		this.on('hide', function() {
			if(!appController.hrefPanelActive) {
				this.destroy();
				delete appController.embeddedPage;
			}
		});
	},

	backHandler: function() {
		ARSnova.app.mainTabPanel.tabPanel.animateActiveItem(
				ARSnova.app.lastActiveMainTabPanel, {
			type: 'slide',
			direction: 'right',
			duration: 700
		});
	},

	setBackHandler: function(handler) {
		var me = this;
		var previousHandler = me.backButton.getHandler();
		// Restore previous back button handler after custom handler has been executed.
		me.backButton.setHandler(Ext.Function.createSequence(handler, function restoreHandler() {
			me.backButton.setHandler(previousHandler);
		}));
	}
});
