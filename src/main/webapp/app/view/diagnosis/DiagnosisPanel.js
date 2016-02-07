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
Ext.define('ARSnova.view.diagnosis.DiagnosisPanel', {
	extend: 'Ext.Container',

	requires: ['ARSnova.view.diagnosis.StatisticsPanel', 'ARSnova.view.diagnosis.UseCasePanel'],

	config: {
		fullscreen: true,
		title: Messages.DIAGNOSIS,
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

		this.on('painted', function () {
			// save last panel for backButton handler
			this.lastActivePanel = ARSnova.app.lastActiveMainTabPanel;
		});

		this.on('activate', function () {
			ARSnova.app.sessionModel.on(ARSnova.app.sessionModel.events.sessionJoinAsSpeaker, this.joinSessionEvent, this);
			ARSnova.app.sessionModel.on(ARSnova.app.sessionModel.events.sessionLeave, this.leaveSessionEvent, this);
		}, this);

		this.on('deactivate', function () {
			ARSnova.app.sessionModel.un(ARSnova.app.sessionModel.events.sessionJoinAsSpeaker, this.joinSessionEvent);
			ARSnova.app.sessionModel.un(ARSnova.app.sessionModel.events.sessionLeave, this.leaveSessionEvent);
		}, this);

		this.backButton = Ext.create('Ext.Button', {
			text: Messages.BACK,
			ui: 'back',
			scope: this,
			handler: function () {
				if (this.lastActivePanel.tab.isHidden()) {
					this.lastActivePanel = 0;
				}

				ARSnova.app.mainTabPanel.tabPanel.animateActiveItem(this.lastActivePanel, {
					type: 'slide',
					direction: 'right',
					duration: 700
				});
			}
		});

		this.toolbar = Ext.create('Ext.Toolbar', {
			title: Messages.DIAGNOSIS,
			docked: 'top',
			ui: 'light',
			items: [this.backButton]
		});

		this.addOnsButton = Ext.create('Ext.Button', {
			text: Messages.ACTIVATE_FEATURES,
			disabled: true,
			handler: function () {
				var me = ARSnova.app.mainTabPanel.tabPanel.diagnosisPanel;
				me.useCasePanel = Ext.create('ARSnova.view.diagnosis.UseCasePanel');
				me.animateActiveItem(me.useCasePanel, 'slide');
			}
		});

		this.inClass = Ext.create('Ext.form.FormPanel', {
			scrollable: null,
			items: [{
				xtype: 'formpanel',
				style: 'marginTop: 15px',
				cls: 'standardForm topPadding',
				scrollable: null,

				defaults: {
					xtype: 'button',
					ui: 'normal',
					cls: 'forwardListButton'
				},

				items: [{
					text: Messages.STATISTIC,
					handler: function () {
						var me = ARSnova.app.mainTabPanel.tabPanel.diagnosisPanel;
						me.statisticsPanel = Ext.create('ARSnova.view.diagnosis.StatisticsPanel');
						me.animateActiveItem(me.statisticsPanel, 'slide');
					}
				}, {
					text: Messages.BROWSER_INFO,
					handler: function (b) {
						this.detect = Ext.create('ARSnova.BrowserDetect');
						var browserInfo = '<p>' + this.detect.browser + ' ' + this.detect.version + '<br>' +
							this.detect.os + '</p><p class="softwareDetails">' + Ext.browser.userAgent + '</p>';
						Ext.Msg.alert('Browser', browserInfo, Ext.emptyFn);
					}
				}, {
					text: Messages.ARSNOVA_RELOAD,
					handler: function (b) {
						Ext.Msg.confirm(Messages.ARSNOVA_RELOAD, Messages.RELOAD_SURE, function (b) {
							if (b === 'yes') {
								if (ARSnova.app.checkSessionLogin()) {
									ARSnova.app.getController('Sessions').logout();
								}
								ARSnova.app.getController('Auth').logout();
								window.location.reload(true);
							}
						});
					}
				}]
			}, {
				style: 'margin-top: 30px',
				html: "<div class='gravure'>Made by <a href='http://www.thm.de/' class='thmlink' target='_blank'><span class='thm-lettering'>THM</span></a></div>",
				cls: null
			}, {
				width: 125,
				style: 'margin: 30px auto',
				html: "<a href='http://www.gnu.org/licenses/gpl-3.0.de.html' target='_blank'><img src='resources/images/gpl-v3-logo.svg' width='120' height='60'></a>"
			}]
		});

		this.add([this.toolbar, this.inClass]);
	},

	joinSessionEvent: function () {
		this.addOnsButton.setDisabled(false);
		this.inClass.down('formpanel').insert(0, this.addOnsButton);
	},

	leaveSessionEvent: function () {
		this.addOnsButton.setDisabled(true);
		this.inClass.down('formpanel').remove(this.addOnsButton, false);
	}
});
