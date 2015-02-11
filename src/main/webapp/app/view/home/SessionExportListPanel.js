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
Ext.define('ARSnova.view.home.SessionExportListPanel', {
	extend: 'Ext.Panel',
	requires: ['ARSnova.view.Caption', 'ARSnova.view.home.SessionList'],

	config: {
		exportType: null,
		fullscreen: true,
		scrollable: {
			direction: 'vertical',
			directionLock: true
		}
	},

	initialize: function () {
		var me = this;

		this.callParent(arguments);

		this.backButton = Ext.create('Ext.Button', {
			text: Messages.SESSIONS,
			ui: 'back',
			handler: function () {
				var hTP = ARSnova.app.mainTabPanel.tabPanel.homeTabPanel;
				hTP.animateActiveItem(hTP.mySessionsPanel, {
					type: 'slide',
					direction: 'right',
					duration: 700
				});
			}
		});

		var toolbarItems = [this.backButton, {xtype: 'spacer'}];

		if (this.getExportType() === 'filesystem') {
			this.ContinueToExport = Ext.create('Ext.Button', {
				text: Messages.CONTINUE,
				itemId: 'continue',
				handler: function () {
					if (!me.checkSelectedSessions()) {
						Ext.Msg.alert(Messages.NOTIFICATION, Messages.EXPORT_NOTIFICATION);
					} else {
						var hTP = ARSnova.app.mainTabPanel.tabPanel.homeTabPanel;
						var exportToFile = Ext.create('ARSnova.view.home.SessionExportToFilePanel', {
							exportSessionMap: me.sessionMap,
							backReference: me
						});
						hTP.animateActiveItem(exportToFile, 'slide');
					}
				}
			});

			toolbarItems.push(this.ContinueToExport);
		}

		this.toolbar = Ext.create('Ext.Toolbar', {
			title: Messages.SESSIONS,
			docked: 'top',
			ui: 'light',
			items: toolbarItems
		});

		this.hintPanel = Ext.create('ARSnova.view.MathJaxMarkDownPanel', {
			xtype: 'mathJaxMarkDownPanel',
			id: 'questionContent',
			style: 'background-color: transparent; color: black; '
		});
		this.hintPanel.setContent(Messages.EXPORT_SESSION_LABEL, true, true);

		this.singleTemplatePanel = Ext.create('Ext.Panel', {
			layout:	{
				type: 'vbox',
				pack: 'center',
				align: 'center'
			},
			items: [this.hintPanel]
		});

		this.sessionsForm = Ext.create('ARSnova.view.home.SessionList', {
			title: Messages.MY_SESSIONS,
			scrollable: null
		});

		this.ppSessionsForm = Ext.create('ARSnova.view.home.SessionList', {
			title: Messages.MY_PUBLIC_POOL_SESSIONS,
			scrollable: null
		});

		this.add([this.toolbar, this.singleTemplatePanel, this.sessionsForm, this.ppSessionsForm]);

		// load user sessions before displaying the page
		this.onBefore('painted', function () {
			if (ARSnova.app.userRole === ARSnova.app.USER_ROLE_SPEAKER) {
				this.mapCounter = 0;
				this.sessionMap = [];
				this.loadCreatedSessions()
					.then(function () {
						if (me.getExportType() === 'filesystem') {
							me.loadCreatedPublicPoolSessions();
						} else {
							me.ppSessionsForm.hide();
						}
					});
			}
		});
	},

	checkSelectedSessions: function () {
		for (var i = 0; i < this.sessionMap.length; i++) {
			if (this.sessionMap[i][1])
				return true;
		}
		return false;
	},

	loadCreatedSessions: function () {
		var me = this;
		var promise = new RSVP.Promise();

		var hideLoadMask = ARSnova.app.showLoadMask(Messages.LOAD_MASK_SEARCH);

		ARSnova.app.sessionModel.getMySessions({
			success: function (response) {
				var sessions = Ext.decode(response.responseText);
				me.displaySessions(sessions, me.sessionsForm, hideLoadMask);
				promise.resolve();
			},
			empty: Ext.bind(function () {
				hideLoadMask();
				me.sessionsForm.hide();
				promise.reject();
			}, this),
			unauthenticated: function () {
				ARSnova.app.getController('Auth').login({
					mode: ARSnova.app.loginMode
				});
				promise.reject();
			},
			failure: function () {
				hideLoadMask();
				console.log("Error while getting sessions.");
				promise.reject();
			}
		}, (window.innerWidth > 481 ? 'name' : 'shortname'));

		return promise;
	},

	loadCreatedPublicPoolSessions: function () {
		var me = this;
		var promise = new RSVP.Promise();

		var hideLoadMask = ARSnova.app.showLoadMask(Messages.LOAD_MASK_SEARCH);

		ARSnova.app.sessionModel.getMyPublicPoolSessions({
			success: function (response) {
				var sessions = Ext.decode(response.responseText);
				me.displaySessions(sessions, me.ppSessionsForm, hideLoadMask);
				promise.resolve();
			},
			empty: Ext.bind(function () {
				hideLoadMask();
				me.ppSessionsForm.hide();
				promise.reject();
			}, this),
			unauthenticated: function () {
				hideLoadMask();
				ARSnova.app.getController('Auth').login({
					mode: ARSnova.app.loginMode
				});
				promise.reject();
			},
			failure: function () {
				hideLoadMask();
				console.log("Error while getting sessions.");
				promise.reject();
			}
		}, (window.innerWidth > 481 ? 'name' : 'shortname'));

		return promise;
	},

	displaySessions: function (sessions, form, hideLoadMask) {
		var me = this;
		form.removeAll();
		form.show();

		var session;
		for (var i = 0, session; session = sessions[i]; i++) {
			var sessionChecked = false;

			me.sessionMap[me.mapCounter] = [session, sessionChecked];

			var shortDateString = "";
			var longDateString = "";
			if (session.creationTime !== 0) {
				var d = new Date(session.creationTime);
				var shortDateString = " (" + moment(d).format('MMM Do YY') + ")";
				var longDateString = " (" + moment(d).format('lll') + ")";
			}

			// Minimum width of 321px equals at least landscape view
			var displaytext = window.innerWidth > 481 ? session.name + longDateString : session.shortName + shortDateString;

			var sessionEntry = null;

			if (me.getExportType() === 'filesystem') {
				var toggleListener = {
					beforechange: function (slider, thumb, newValue, oldValue) {
					},
					change: function (slider, thumb, newValue, oldValue) {
						// TODO why is 0 toggle checked and 1 toggle unchecked?
						if (newValue === 0) { // true
							// Changing from off to on
							var id = slider.id.split('_')[1];
							me.sessionMap[id][1] = true;
						} else if (newValue === 1) { // false
							// Changing from on to off
							var id = slider.id.split('_')[1];
							me.sessionMap[id][1] = false;
						}
					}
				};

				sessionEntry = Ext.create('Ext.field.Toggle', {
					id: 'sessionToggle_' + me.mapCounter,
					label: Ext.util.Format.htmlEncode(displaytext),
					labelWidth: 'auto',
					labelCls: 'session-toggle-label',
					cls: 'rightAligned',
					iconCls: "icon-cloud thm-green",
					sessionObj: session,
					value: sessionChecked
				});

				sessionEntry.setListeners(toggleListener);
			} else if (me.getExportType() === 'public_pool') {
				sessionEntry = Ext.create('ARSnova.view.MultiBadgeButton', {
					ui: 'normal',
					text: Ext.util.Format.htmlEncode(displaytext),
					cls: 'forwardListButton',
					sessionObj: session,
					handler: function (options) {
						var hTP = ARSnova.app.mainTabPanel.tabPanel.homeTabPanel;

						var exportSession = options.config.sessionObj;

						// validate session for public pool
						if (exportSession.numQuestions < 1) {
							Ext.Msg.alert(Messages.NOTIFICATION, Messages.SESSIONPOOL_NOTIFICATION_QUESTION_NUMBER);
						} else {
							var exportToPublic = Ext.create('ARSnova.view.home.SessionExportToPublicPanel', {
								exportSession: exportSession,
								backReference: me
							});

							hTP.animateActiveItem(exportToPublic, 'slide');
						}
					}
				});
			}
			me.mapCounter++;
			form.addEntry(sessionEntry);
		}

		hideLoadMask();
	}

});
