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
Ext.define('ARSnova.view.RolePanel', {
	extend: 'Ext.Container',

	config: {
		fullscreen: true,
		scrollable: {
			direction: 'vertical',
			directionLock: true
		},

		tab: {
			hidden: true
		},

		title: 'RolePanel'
	},

	buttonColorChange: {
		run: function () {
			var panel = ARSnova.app.mainTabPanel.tabPanel.rolePanel;

			if (panel.selectState) {
				panel.studentButton.addImageCls('thm-green');
				panel.speakerButton.removeImageCls('thm-green');
			} else {
				panel.speakerButton.addImageCls('thm-green');
				panel.studentButton.removeImageCls('thm-green');
			}

			panel.selectState = !panel.selectState;
		},
		interval: 2000
	},

	initialize: function () {
		var uniEnabled = ARSnova.app.globalConfig.uniPanelEnabled ? ARSnova.app.globalConfig.uniPanelEnabled : "";
		this.callParent(arguments);
		var isPhone = (Ext.os.is.Phone && Ext.os.is.iOS);
		var smallHeight = document.body.clientHeight <= 460;
		var mediumHeight = document.body.clientHeight >= 520;
		var slogan = ARSnova.app.globalConfig.arsnovaSlogan ? ARSnova.app.globalConfig.arsnovaSlogan : "";

		this.speakerButton = Ext.create('ARSnova.view.MatrixButton', {
			id: 'role-select-speaker',
			text: Messages.SPEAKER,
			value: ARSnova.app.USER_ROLE_SPEAKER,
			imageCls: "icon-presenter"
		});

		this.studentButton = Ext.create('ARSnova.view.MatrixButton', {
			id: 'role-select-student',
			text: Messages.STUDENT,
			value: ARSnova.app.USER_ROLE_STUDENT,
			imageCls: "icon-users",
			style: 'margin-left: 20px;'
		});

		this.add([{
			xtype: 'toolbar',
			docked: 'top',
			ui: 'light',
			title: Messages.TITLE_ROLE,
			cls: null
		}, {
			xtype: 'panel',
			cls: null,
			html: "<div class='icon-logo'>" +
					"<span class='icon-logo-radar'>r</span>" +
					"<span class='icon-logo-ars'>a</span>" +
					"<span class='icon-logo-nova'>n</span>" +
					"</div>",
			style: {
				marginTop: isPhone && !mediumHeight ? (smallHeight ? '5px' : '10px') : '25px'
			}
		}, {
			xtype: 'panel',
			style: {
				marginBottom: isPhone && !mediumHeight ? (smallHeight ? '10px' : '15px') : '30px'
			},
			html: "<div class='gravure'>" + slogan + "</div>",
			cls: null
		}, {
			xtype: 'container',
			layout: {
				type: 'hbox',
				pack: 'center'
			},
			style: isPhone && smallHeight ? 'height: 100px;' : 'height: 110px',
			defaults: {
				xtype: 'matrixbutton',
				handler: function (b) {
					ARSnova.app.getController('Auth').roleSelect({
						mode: b.config.value
					});
				}
			},
			items: [
				this.speakerButton,
				this.studentButton
			]
		}, {
			xtype: 'container',
			layout: {
				type: 'hbox',
				pack: 'center'
			},
			style: 'margin-top: 15px',
			items: [{
				xtype: 'matrixbutton',
				hidden: (uniEnabled !== 'true'),
				text: Messages.ABOUT,
				imageCls: "icon-book",
				handler: function () {
					ARSnova.app.mainTabPanel.tabPanel.animateActiveItem(
							ARSnova.app.mainTabPanel.tabPanel.aboutUniTabPanel, 'slide'
						);
				}
			}]
		}]);

		this.on('activate', function () {
			this.selectState = false;
			ARSnova.app.taskManager.start(this.buttonColorChange);
		});

		this.on('deactivate', function () {
			ARSnova.app.taskManager.stop(this.buttonColorChange);
		});
	}
});
