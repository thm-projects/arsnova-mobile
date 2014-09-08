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
Ext.define('ARSnova.view.MainTabPanel', {
	extend: 'Ext.Container',

	requires: ['ARSnova.view.TabPanel'],

	config: {
		fullscreen: true,
		layout: 'card'
	},

	initialize: function () {
		this.callParent(arguments);

		this.tabPanel = Ext.create('ARSnova.view.TabPanel');

		this.add([this.tabPanel]);
	},

	setActiveItem: function (card, animation) {
		this.callParent(arguments);

		if (typeof(animation) == 'object') {
			animation.duration = ARSnova.app.cardSwitchDuration;
		} else {
			animation = {
				type: animation,
				duration: ARSnova.app.cardSwitchDuration
			};
		}
	}
});
