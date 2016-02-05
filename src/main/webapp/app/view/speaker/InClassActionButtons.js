/*
 * This file is part of ARSnova Mobile.
 * Copyright (C) 2011-2012 Christian Thomas Weber
 * Copyright (C) 2012-2016 The ARSnova Team
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
Ext.define('ARSnova.view.speaker.InClassActionButtons', {
	extend: 'Ext.Panel',

	config: {
		layoutTemplate: {
			type: 'hbox',
			pack: 'center'
		},
		style: 'margin-top: 20px'
	},

	initialize: function () {
		this.callParent(arguments);

		this.sessionStatusButton = Ext.create('ARSnova.view.SessionStatusButton');

		this.deleteSessionButton = Ext.create('ARSnova.view.MatrixButton', {
			id: 'delete-session-button',
			text: Messages.DELETE_SESSION,
			buttonConfig: 'icon',
			cls: 'smallerActionButton',
			imageCls: 'icon-close',
			scope: this,
			handler: function () {
				var msg = Messages.ARE_YOU_SURE +
						"<br>" + Messages.DELETE_SESSION_NOTICE;
				Ext.Msg.confirm(Messages.DELETE_SESSION_TITLE, msg, function (answer) {
					if (answer === 'yes') {
						ARSnova.app.showLoadIndicator(Messages.LOAD_MASK_SESSION_DELETE);
						ARSnova.app.sessionModel.destroy(sessionStorage.getItem('keyword'), {
							success: function () {
								ARSnova.app.getController('Sessions').logout();
							},
							failure: function (response) {
								console.log('server-side error delete session');
							}
						});
					}
				});
			}
		});

		this.featureChangeEntryButton = Ext.create('ARSnova.view.MatrixButton', {
			text: Messages.CHANGE_FEATURES,
			buttonConfig: 'icon',
			cls: 'smallerActionButton',
			imageCls: 'icon-dashboard',
			scope: this,
			handler: function () {
				ARSnova.app.getController('Sessions').loadFeatureOptions({
					inClassPanelEntry: true,
					lastPanel: this.getParent().getParent()
				});
			}
		});

		this.motdButton = Ext.create('ARSnova.view.MatrixButton', {
			text: Messages.MOTD_MANAGEMENT,
			cls: 'smallerActionButton',
			buttonConfig: 'icon',
			imageCls: 'icon-blog',
			scope: this,
			handler: function () {
				ARSnova.app.getController('Motds').listAllSessionMotds(sessionStorage.getItem('keyword'));
			}
		});

		this.on('resize', this.onResize);
		this.addComponents();
	},

	addComponents: function () {
		this.twoRows = document.body.clientWidth < 450;
		var components = this.twoRows ?
			this.getTwoRowedComponents() :
			this.getOneRowedComponents();

		this.add(components);
	},

	onResize: function () {
		var clientWidth = document.body.clientWidth;

		if (clientWidth >= 450 && this.twoRows ||
			clientWidth < 450 && !this.twoRows) {
			this.removeAll(false);
			this.addComponents();
		}
	},

	getOneRowedComponents: function () {
		return [{
			xtype: 'panel',
			layout:  this.config.layoutTemplate,
			items: [{
				xtype: 'spacer',
				flex: '3',
				width: true
			}, this.featureChangeEntryButton, {
				xtype: 'spacer'
			}, this.motdButton, {
				xtype: 'spacer'
			}, this.sessionStatusButton, {
				xtype: 'spacer'
			}, this.deleteSessionButton, {
				xtype: 'spacer',
				flex: '3',
				width: true
			}]
		}];
	},

	getTwoRowedComponents: function () {
		var firstRowComponents = [{
				xtype: 'spacer',
				flex: '3',
				width: true
			}, this.featureChangeEntryButton, {
				xtype: 'spacer'
			}, this.motdButton, {
				xtype: 'spacer',
				flex: '3',
				width: true
			}
		];

		var secondRowComponents = [{
				xtype: 'spacer',
				flex: '3',
				width: true
			}, this.sessionStatusButton, {
				xtype: 'spacer'
			}, this.deleteSessionButton, {
				xtype: 'spacer',
				flex: '3',
				width: true
			}
		];

		return [{
			xtype: 'panel',
			layout: this.config.layoutTemplate,
			items: firstRowComponents
		}, {
			xtype: 'panel',
			style: 'margin-top: 10px',
			layout:  this.config.layoutTemplate,
			items: secondRowComponents
		}];
	}
});
