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

Ext.define('ARSnova.view.about.AboutUniTabPanel', {
	extend: 'Ext.Container',

	requires: ['ARSnova.view.MatrixButton'],

	config: {
		fullscreen: true,
		scrollable: {
			direction: 'vertical',
			directionLock: true
		},

		layoutOnOrientationChange: false,
		monitorOrientation: false,

		title: Messages.ABOUT
	},

	initialize: function () {
		this.callParent(arguments);
		var unitext = ARSnova.app.globalConfig.uniPanelText ? ARSnova.app.globalConfig.uniPanelText: "";
		var me = this;
		this.arsLogo = {
			xtype: 'panel',
			style: 'marginTop: 15px'
		};

		me.add([{
					html: "<div class='gravure'>" + unitext + "</div>"
				}, {
					xtype: 'toolbar',
					docked: 'top',
					ui: 'light',
					title: this.getTitle(),
					cls: null,
					items: [{
							text: Messages.BACK,
							ui: 'back',
							handler: function () {
								ARSnova.app.mainTabPanel.tabPanel.animateActiveItem(ARSnova.app.mainTabPanel.tabPanel.rolePanel, {
									type: 'slide',
									direction: 'right',
									duration: 500
								});
							}
						}
					]
				}
			]);
	}
});
