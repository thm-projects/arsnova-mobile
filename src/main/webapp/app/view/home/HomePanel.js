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
Ext.define('ARSnova.view.home.HomePanel', {
	extend: 'Ext.Container',

	requires: [
		'ARSnova.view.home.SessionList',
		'ARSnova.view.Caption'
	],

	config: {
		fullscreen: true,
		scrollable: {
			direction: 'vertical',
			directionLock: true
		}
	},

	inClassRendered: false,
	userInClass: null,
	speakerInClass: null,
	outOfClass: null,

	/* toolbar items */
	toolbar: null,
	logoutButton: null,
	sessionLogoutButton: null,

	initialize: function () {
		var me = this;
		var config = ARSnova.app.globalConfig;
		this.callParent(arguments);

		this.logoutButton = Ext.create('Ext.Button', {
			text: Messages.LOGOUT,
			ui: 'back',
			handler: function () {
				ARSnova.app.getController('Auth').logout();
			}
		});

		this.toolbar = Ext.create('Ext.Toolbar', {
			title: 'Session',
			docked: 'top',
			ui: 'light',
			items: [
				this.logoutButton
			]
		});

		this.outOfClass = Ext.create('Ext.form.FormPanel', {
			title: 'Out of class',
			cls: 'standardForm',
			scrollable: null,

			items: [{
				xtype: 'button',
				ui: 'normal',
				text: 'Sessions',
				cls: 'forwardListButton',
				controller: 'user',
				action: 'index',
				handler: this.buttonClicked
			}]
		});

		this.sessionLoginForm = Ext.create('Ext.Panel', {
			layout: {
				type: 'vbox',
				pack: 'center',
				align: 'center'
			},

			style: 'marginTop: 15px',

			items: [{
				submitOnAction: false,
				xtype: 'formpanel',
				cls: 'loginFieldSet',
				scrollable: null,
				width: '310px',
				margin: '0 auto',

				items: [{
					xtype: 'textfield',
					component: {
						xtype: 'input',
						cls: 'joinSessionInput',
						type: 'tel',
						maxLength: 16
					},
					name: 'keyword',
					style: !!ARSnova.app.globalConfig.demoSessionKey ? 'margin-bottom: 5px' : '',
					placeHolder: Messages.SESSIONID_PLACEHOLDER,
					listeners: {
						scope: this,
						action: this.onSubmit
					}
				}, {
					xtype: 'label',
					cls: 'gravure',
					style: 'margin-bottom: 15px; opacity: 0.9; font-size: 0.95em;',
					hidden: !ARSnova.app.globalConfig.demoSessionKey,
					html: Messages.DEMO_SESSION + ARSnova.app.globalConfig.demoSessionKey
				}, {
					xtype: 'button',
					ui: 'confirm',
					text: Messages.GO,
					handler: this.onSubmit,
					scope: this
				}]
			}]
		});

		this.caption = Ext.create('ARSnova.view.Caption', {
			cls: 'x-form-fieldset',
			style: "border-radius: 15px"
		});

		this.lastVisitedSessionsForm = Ext.create('ARSnova.view.home.SessionList', {
			scrollable: null,
			title: Messages.LAST_VISITED_SESSIONS_STUDENT
		});

		this.mySessionsForm = Ext.create('ARSnova.view.home.SessionList', {
			scrollable: null,
			title: Messages.MY_SESSIONS
		});

		this.add([
			this.toolbar,
			this.sessionLoginForm,
			this.lastVisitedSessionsForm,
			this.mySessionsForm
		]);

		if (config.features.publicPool) {
			this.publicPoolButton = Ext.create('ARSnova.view.MatrixButton', {
				text: 'Pool',
				buttonConfig: 'icon',
				imageCls: 'icon-cloud thm-green',
				scope: this,
				handler: function () {
					// get public pool sessions from server
					ARSnova.app.restProxy.getPublicPoolSessions({
						success: function (sessionList) {
							var hTP = ARSnova.app.mainTabPanel.tabPanel.homeTabPanel;
							me.publicPoolPanel = Ext.create('ARSnova.view.home.PublicPoolPanel', {
								sessions: sessionList
							});

							hTP.animateActiveItem(me.publicPoolPanel, {
								type: 'slide',
								direction: 'left',
								duration: 700
							});
						},
						empty: function () {
							Ext.Msg.alert(Messages.ERROR, Messages.SESSIONPOOL_ERR_NO_PPSESSIONS);
						},
						failure: function () {
							Ext.Msg.alert(Messages.ERROR, Messages.SESSIONPOOL_ERR_NO_PPSESSIONS);
						},
						unauthenticated: function () {
							Ext.Msg.alert(Messages.ERROR, Messages.SESSIONPOOL_ERR_PPSESSION_RIGHTS);
						}
					});
				}
			});

			this.matrixButtonPanel = Ext.create('Ext.Panel', {
				layout: {
					type: 'hbox',
					pack: 'center'
				},
				style: 'margin-top:10px;',
				items: [
					this.publicPoolButton
				]
			});

			this.add(this.matrixButtonPanel);
		}

		this.onBefore('painted', function () {
			var me = this;
			if (ARSnova.app.userRole !== ARSnova.app.USER_ROLE_SPEAKER) {
				var handler = function success(sessions) {
					me.caption.summarize(sessions, {questions: false, answers: false, interposed: false, unanswered: true});
					me.add(me.caption);
				};
				var p1 = this.loadVisitedSessions();
				var p2 = this.loadMySessions();
				// get the summary of all session lists
				RSVP.all([p1, p2]).then(handler, function error() {
					// errors swallow results, retest each promise seperately to figure out if one succeeded
					p1.then(handler);
					p2.then(handler);
				});
			}
		});
	},

	checkLogin: function () {
		if (ARSnova.app.loginMode === ARSnova.app.LOGIN_THM) {
			this.logoutButton.addCls('thm');
		}
	},

	buttonClicked: function (button) {
		ARSnova.app.getController(button.controller)[button.action]();
	},

	onSubmit: function () {
		ARSnova.app.showLoadMask(Messages.LOGIN_LOAD_MASK);

		// delete the textfield-focus, to hide the numeric keypad on phones
		this.down('textfield').blur();

		ARSnova.app.getController('Sessions').login({
			keyword: this.down('textfield').getValue().replace(/ /g, ""),
			destroy: false,
			panel: this
		});
	},

	loadVisitedSessions: function () {
		if (ARSnova.app.userRole === ARSnova.app.USER_ROLE_SPEAKER) {
			return;
		}
		var me = this;
		var promise = new RSVP.Promise();

		var hideLoadingMask = ARSnova.app.showLoadMask(Messages.LOAD_MASK_SEARCH);

		ARSnova.app.restProxy.getMyVisitedSessions({
			success: function (sessions) {
				me.displaySessions(sessions, me.lastVisitedSessionsForm, hideLoadingMask);
				if (sessions.length > 0) {
					promise.resolve(sessions);
				} else {
					promise.reject();
				}
			},
			unauthenticated: function () {
				hideLoadingMask();
				ARSnova.app.getController('Auth').login({
					mode: ARSnova.app.loginMode
				});
				promise.reject();
			},
			failure: function () {
				hideLoadingMask();
				console.log('server-side error loggedIn.save');
				ARSnova.app.mainTabPanel.tabPanel.homeTabPanel.homePanel.lastVisitedSessionsForm.hide();
				promise.reject();
			}
		}, (window.innerWidth > 481 ? 'name' : 'shortname'));
		return promise;
	},

	loadMySessions: function () {
		if (ARSnova.app.userRole === ARSnova.app.USER_ROLE_SPEAKER) {
			return;
		}
		var me = this;
		var promise = new RSVP.Promise();

		var hideLoadingMask = ARSnova.app.showLoadMask(Messages.LOAD_MASK_SEARCH);

		ARSnova.app.sessionModel.getMySessions({
			success: function (response) {
				var sessions = Ext.decode(response.responseText);
				me.displaySessions(sessions, me.mySessionsForm, hideLoadingMask);
				if (sessions.length > 0) {
					promise.resolve(sessions);
				} else {
					promise.reject();
				}
			},
			empty: function () {
				hideLoadingMask();
				me.mySessionsForm.hide();
				promise.reject();
			},
			unauthenticated: function () {
				hideLoadingMask();
				ARSnova.app.getController('Auth').login({
					mode: ARSnova.app.loginMode
				});
				promise.reject();
			},
			failure: function () {
				hideLoadingMask();
				console.log('server-side error loggedIn.save');
				ARSnova.app.mainTabPanel.tabPanel.homeTabPanel.homePanel.mySessionsForm.hide();
				promise.reject();
			}
		}, (window.innerWidth > 481 ? 'name' : 'shortname'));
		return promise;
	},

	displaySessions: function (sessions, form, hideLoadingMask) {
		if (sessions && sessions.length !== 0) {
			form.removeAll();
			form.show();

			var buttonHandler = function (options) {
				var hideLoadMask = ARSnova.app.showLoadMask(Messages.LOAD_MASK_LOGIN);
				ARSnova.app.getController('Sessions').login({
					keyword: options.config.sessionObj.keyword
				});
				hideLoadMask();
			};
			for (var i = 0; i < sessions.length; i++) {
				var session = sessions[i];

				var icon = "icon-users thm-green";
				if (session.courseType && session.courseType.length > 0) {
					icon = "icon-prof";
				}

				var iconCls = icon + " courseIcon";

				if (session.sessionType === 'public_pool') {
					iconCls = "icon-cloud thm-green";
				}

				// Minimum width of 481px equals at least landscape view
				var sessionkey = '<span class="sessionButtonKeyword"> (' + session.keyword + ')</span>';
				var displaytext = window.innerWidth > 481 ?
					Ext.util.Format.htmlEncode(session.name) + sessionkey :
					Ext.util.Format.htmlEncode(session.shortName);

				var sessionButton = Ext.create('ARSnova.view.MultiBadgeButton', {
					xtype: 'button',
					ui: 'normal',
					text: displaytext,
					cls: 'forwardListButton',
					iconCls: iconCls,
					controller: 'sessions',
					action: 'showDetails',
					badgeCls: 'badgeicon',
					sessionObj: session,
					handler: buttonHandler
				});
				sessionButton.setBadge([{badgeText: session.numUnanswered}]);
				form.addEntry(sessionButton);

				if (!session.active) {
					this.down('button[text=' + displaytext + ']').addCls("isInactive");
				}
			}
		} else {
			form.hide();
		}
		hideLoadingMask();
	}
});
