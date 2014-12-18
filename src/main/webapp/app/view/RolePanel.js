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
Ext.define('ARSnova.view.RolePanel', {
	extend: 'Ext.Container',

	config: {
		fullscreen: true,
		scrollable: {
			direction: 'vertical',
			directionLock: true
		},

		title: 'RolePanel'
	},

	initialize: function () {
		this.callParent(arguments);

		this.add([{
			xtype: 'toolbar',
			docked: 'top',
			ui: 'light',
			title: Messages.TITLE_ROLE,
			cls: null
		}, {
			xtype: 'panel',
			cls: null,
			html: 	"<div class='icon-logo'>" +
					"<span class='icon-logo-radar'>r</span>" +
					"<span class='icon-logo-ars'>a</span>" +
					"<span class='icon-logo-nova'>n</span>" +
					"</div>",
			style: {marginTop: '35px', marginBottom: '35px'}
		}, {
			xtype: 'container',
			layout: {
				type: 'hbox',
				pack: 'center'
			},
			defaults: {
				xtype: 'matrixbutton',
				handler: function (b) {
					ARSnova.app.getController('Auth').roleSelect({
						mode: b.config.value
					});
				}
			},
			items: [
				{
					text: Messages.STUDENT,
					value: ARSnova.app.USER_ROLE_STUDENT,
					image: "login_student",
					imageCls: "icon-users thm-grey",
					imageStyle: {}
				},
				{
					text: Messages.SPEAKER,
					value: ARSnova.app.USER_ROLE_SPEAKER,
					image: "ars_logo",
					imageCls: "icon-presenter thm-green",
					imageStyle: {},
					style: "margin-left:20px"
				}
			]
		}, {
			xtype: 'panel',
			style: {
				marginTop: (Ext.os.is.Phone && Ext.os.is.iOS) ? '50px': '80px'
			},
			html: "<div class='gravure'><a href='http://www.thm.de/' class='thmlink' target='_blank'>A <span style='color:#699824;'>THM</span> Product</a></div>",
			cls: null
		}]);
	}
});
