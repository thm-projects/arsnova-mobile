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
Ext.define('ARSnova.view.home.SessionInfoPanel', {
	extend: 'Ext.Panel',

	config: {
		backRef: null,
		fullscreen: true,
		scrollable: {
			direction: 'vertical',
			directionLock: true
		},
		session: null
	},

	constructor: function (args) {
		this.callParent(arguments);

		var me = this;
		var screenWidth = (window.innerWidth > 0) ?
				window.innerWidth :	screen.width;
		var showShortLabels = screenWidth < 480;

		//
		// Toolbar items
		//

		this.backButton = Ext.create('Ext.Button', {
			text: Messages.BACK,
			ui: 'back',
			scope: this,
			handler: function () {
				var hTP = ARSnova.app.mainTabPanel.tabPanel.homeTabPanel;
				hTP.animateActiveItem(hTP.mySessionsPanel, {
					type: 'slide',
					direction: 'right',
					duration: 700
				});
				sessionStorage.removeItem("keyword");

				localStorage.removeItem("name");
				localStorage.removeItem("shortName");
			}
		});



		this.toolbar = Ext.create('Ext.Toolbar', {
			title: "Session Info",
			docked: 'top',
			ui: 'light',
			items: [
				this.backButton
			]
		});
		
		this.add(this.toolbar)
	}
});