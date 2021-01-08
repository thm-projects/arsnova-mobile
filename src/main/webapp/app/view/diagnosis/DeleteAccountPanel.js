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
Ext.define('ARSnova.view.diagnosis.DeleteAccountPanel', {
	extend: 'Ext.Container',

	requires: ['Ext.form.Panel', 'Ext.form.FieldSet'],

	config: {
		fullscreen: true,
		title: 'DeleteAccountPanel',
		scrollable: {
			direction: 'vertical',
			directionLock: true
		},
		layout: {
			type: 'vbox',
			pack: 'center'
		}
	},

	/* toolbar items */
	toolbar: null,
	backButton: null,

	initialize: function () {
		this.callParent(arguments);

		var me = this;

		this.backButton = Ext.create('Ext.Button', {
			text: Messages.BACK,
			ui: 'back',
			handler: function () {
				var me = ARSnova.app.mainTabPanel.tabPanel.diagnosisPanel;

				me.animateActiveItem(me.diagnosisPanel, {
					type: 'slide',
					direction: 'right',
					scope: this
				});
			}
		});

		this.toolbar = Ext.create('Ext.Toolbar', {
			title: Messages.DELETE_ACCOUNT,
			docked: 'top',
			ui: 'light',
			items: [this.backButton]
		});

		this.userDeletePanel = Ext.create('Ext.form.FormPanel', {
			scrollable: null,
			hidden: true,
			items: [{
				xtype: 'label',
				html: Messages.DELETE_ACCOUNT_INFO
			}, {
				xtype: 'button',
				ui: 'decline',
				cls: 'centerButton',
				text: Messages.DELETE,
				handler: function () {
					var username = localStorage.getItem('login');
					ARSnova.app.restProxy.deleteUserAccount(username, {
						success: Ext.bind(function () {
							this.logout(username);
							this.showSuccessDialog();
						}, this),
						failure: this.showErrorDialog
					});
				},
				scope: this
			}]
		});

		this.usernameField = Ext.create('Ext.field.Text', {
			label: Messages.USER_ACCOUNT
		});
		this.adminDeletePanel = Ext.create('Ext.form.FormPanel', {
			scrollable: null,
			hidden: true,
			items: [{
				xtype: 'label',
				html: Messages.DELETE_ACCOUNT_INFO_ADMIN
			},
			this.usernameField,
			{
				xtype: 'button',
				ui: 'decline',
				cls: 'centerButton',
				text: Messages.DELETE,
				handler: function () {
					var login = localStorage.getItem('login');
					var username = this.usernameField.getValue();
					if (username.length === 0) {
						return;
					}
					ARSnova.app.restProxy.deleteUserAccount(username, {
						success: Ext.bind(function () {
							if (login === username) {
								this.logout(username);
							}
							this.showSuccessDialog();
						}, this),
						failure: this.showErrorDialog
					});
				},
				scope: this
			}]
		});

		this.add([this.toolbar, this.userDeletePanel, this.adminDeletePanel]);

		this.on('activate', function () {
			this.userDeletePanel.setHidden(ARSnova.app.isAdmin);
			this.adminDeletePanel.setHidden(!ARSnova.app.isAdmin);
		});
	},

	showSuccessDialog: function () {
		Ext.Msg.alert(Messages.DELETE_ACCOUNT, Messages.DELETE_ACCOUNT_SUCCESS);
	},

	showErrorDialog: function () {
		Ext.Msg.alert(Messages.DELETE_ACCOUNT, Messages.DELETE_ACCOUNT_ERROR);
	},

	logout: function (username) {
		if (sessionStorage.getItem('keyword') !== null) {
			ARSnova.app.getController('Sessions').logout();
		}
		localStorage.removeItem('login');
		var guestToken = localStorage.getItem('guestToken');
		if (guestToken === username) {
			localStorage.removeItem('guestToken');
		}
		ARSnova.app.getController('Auth').logout();
		sessionStorage.clear();
	}
});
