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

Ext.define('ARSnova.view.home.TabPanel', {
	extend: 'Ext.Panel',

	requires: [
		'ARSnova.view.home.HomePanel',
		'ARSnova.view.home.MySessionsPanel',
		'ARSnova.view.home.NewSessionPanel'
	],

	config: {
		title: Messages.HOME,
		iconCls: 'icon-home',
		layout: 'card'
	},

	initialize: function () {
		this.callParent(arguments);

		/* out of class */
		this.homePanel = Ext.create('ARSnova.view.home.HomePanel');
		this.mySessionsPanel = Ext.create('ARSnova.view.home.MySessionsPanel');
		this.newSessionPanel = Ext.create('ARSnova.view.home.NewSessionPanel');

		this.add([
			this.homePanel,
			this.mySessionsPanel,
			this.newSessionPanel
		]);
	}
});
