/*
 * This file is part of ARSnova Mobile.
 * Copyright (C) 2011-2012 Christian Thomas Weber
 * Copyright (C) 2012-2017 The ARSnova Team
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

Ext.define('ARSnova.view.about.BlogTabPanel', {
	extend: 'Ext.tab.Panel',

	requires: ['ARSnova.view.components.EmbeddedPage'],

	config: {
		title: Messages.BLOG,
		iconCls: 'icon-blog',

		scrollable: {
			direction: 'vertical',
			directionLock: true
		},

		tabBar: {
			hidden: true
		}
	},

	page: null,

	initialize: function () {
		this.callParent(arguments);

		this.toolbar = Ext.create('Ext.Toolbar', {
			docked: 'top',
			title: this.getTitle(),
			ui: 'light',
			items: [{
				xtype: 'button',
				text: Messages.BACK,
				ui: 'back',
				scope: this,
				handler: function () {
					ARSnova.app.mainTabPanel.tabPanel.animateActiveItem(ARSnova.app.lastActiveMainTabPanel, {
						type: 'slide',
						direction: 'right',
						duration: 700
					});
				}
			}]
		});
		this.add(this.toolbar);

		var url = ARSnova.app.globalConfig.blogUrl || "https://arsnova.eu/blog/features/";
		this.page = this.add(Ext.create('ARSnova.view.components.EmbeddedPage', {
			src: url,
			handleEvents: false
		}));

		this.on('show', function () {
			this.page.embedOrOpenTab();
		});
	}
});
