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
Ext.define('ARSnova.view.diagnosis.DeleteSessionPanel', {
	extend: 'Ext.Container',

	requires: ['Ext.form.Panel', 'Ext.form.FieldSet'],

	config: {
		fullscreen: true,
		title: 'DeleteSessionPanel',
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
			title: Messages.DELETE_SESSION_ADMIN,
			docked: 'top',
			ui: 'light',
			items: [this.backButton]
		});

		this.sessionkeyField = Ext.create('Ext.field.Text', {
			placeHolder: Messages.SESSIONID_PLACEHOLDER,
			component: {
				type: 'tel',
				maxLength: 16
			}
		});
		this.adminDeletePanel = Ext.create('Ext.form.FormPanel', {
			scrollable: null,
			width: '350px',
			items: [
				this.sessionkeyField,
				{
					xtype: 'button',
					ui: 'decline',
					cls: 'centerButton',
					text: Messages.DELETE,
					handler: function () {
						var sessionkey = this.sessionkeyField.getValue().replace(/ /g, '');
						if (!sessionkey) {
							return;
						}
						ARSnova.app.restProxy.delSession(sessionkey, {
							success: Ext.bind(function () {
								this.showSuccessDialog();
							}, this),
							failure: this.showErrorDialog
						});
					},
					scope: this
				}
			]
		});

		this.add([this.toolbar, this.adminDeletePanel]);
	},

	showSuccessDialog: function () {
		Ext.Msg.alert(Messages.DELETE_SESSION_TITLE, Messages.DELETE_SESSION_SUCCESS);
	},

	showErrorDialog: function () {
		Ext.Msg.alert(Messages.DELETE_SESSION_TITLE, Messages.DELETE_SESSION_ERROR);
	}
});
