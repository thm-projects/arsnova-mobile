/*
 * This file is part of ARSnova Mobile.
 * Copyright (C) 2011-2012 Christian Thomas Weber
 * Copyright (C) 2012-2019 The ARSnova Team and Contributors
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
Ext.define('ARSnova.view.speaker.StatisticTabPanel', {
	extend: 'Ext.tab.Panel',

	config: {
		title: Messages.STATISTIC,
		tabBarPosition: 'bottom',
		iconCls: 'icon-chart'
	},

	initialize: function () {
		this.callParent(arguments);

		this.roundManagementPanel = Ext.create('ARSnova.view.speaker.RoundManagementPanel');

		this.add([
			this.roundManagementPanel
		]);

		this.on('painted', function () {
			this.roundManagementPanel.updateEditButtons();
		});

		this.on('activate', function () {
			var innerItems = this.getInnerItems();

			if (innerItems[0] && innerItems[0].questionObj) {
				this.roundManagementPanel.tab.setHidden(
					ARSnova.app.activePiQuestion &&
					ARSnova.app.activePiQuestion !== innerItems[0].questionObj._id ||
					innerItems[0].questionObj.questionType === 'slide'
				);
			}
		});
	}
});
