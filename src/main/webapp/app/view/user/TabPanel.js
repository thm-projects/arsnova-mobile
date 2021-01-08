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
Ext.define('ARSnova.view.user.TabPanel', {
	extend: 'Ext.tab.Panel',

	requires: ['ARSnova.view.user.InClass', 'ARSnova.view.LearningProgressPanel'],

	config: {
		title: Messages.HOME,

		iconCls: 'icon-home',
		scroll: 'vertical',

		tabBar: {
			hidden: true
		}
	},

	constructor: function () {
		this.callParent(arguments);

		this.inClassPanel = Ext.create('ARSnova.view.user.InClass');
		this.learningProgressPanel = Ext.create('ARSnova.view.LearningProgressPanel');

		this.add([
			this.inClassPanel
		]);
	},

	renew: function () {
		this.remove(this.inClassPanel);
		this.inClassPanel = Ext.create('ARSnova.view.user.InClass');
		this.insert(0, this.inClassPanel);
		this.setActiveItem(0);
		this.inClassPanel.registerListeners();
	}
});
