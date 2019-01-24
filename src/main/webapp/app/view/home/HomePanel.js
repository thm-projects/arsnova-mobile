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
Ext.define('ARSnova.view.home.HomePanel', {
	extend: 'Ext.Container',

	requires: [
		'ARSnova.view.home.SessionList',
		'ARSnova.view.Caption',
		'ARSnova.view.components.MotdMessageBox'
	],

	config: {
		fullscreen: true,
		scrollable: {
			direction: 'vertical',
			directionLock: true
		},
		layout: {
			type: 'vbox',
			pack: 'center'
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

	listOffset: 10,
	mySessionsObject: null,
	visitedSessionsObject: null,

	initialize: function () {
		var me = this;
		var config = ARSnova.app.globalConfig;
		var screenWidth = (window.innerWidth > 0) ? window.innerWidth : screen.width;
		this.callParent(arguments);

		this.logoutButton = Ext.create('Ext.Button', {
			text: Messages.LOGOUT,
			align: 'left',
			ui: 'back',
			handler: function () {
				ARSnova.app.getController('Auth').logout();
			}
		});

		this.roleIcon = Ext.create('Ext.Component', {
			cls: 'roleIcon userRole',
			hidden: (screenWidth < 370),
			align: 'left'
		});

		this.changeRoleButton = Ext.create('Ext.Button', {
			text: Messages.CHANGE_ROLE,
			align: 'right',
			ui: 'confirm',
			scope: this,
			handler: function (button) {
				button.disable();
				ARSnova.app.getController('Auth').changeRole(
					ARSnova.app.USER_ROLE_SPEAKER, function () {
						button.enable();
					}
				);
			}
		});

		this.toolbar = Ext.create('Ext.TitleBar', {
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

		this.sessionInput = Ext.create('Ext.field.Text', {
			component: {
				xtype: 'input',
				cls: 'joinSessionInput',
				type: 'tel',
				maxLength: 16
			},
			name: 'keyword',
			style: ARSnova.app.globalConfig.demoSessionKey ? 'margin-bottom: 5px' : '',
			placeHolder: Messages.SESSIONID_PLACEHOLDER,
			listeners: {
				scope: this,
				action: this.onSubmit
			}
		});

		this.demoSessionLabel = Ext.create('Ext.Label', {
			cls: 'gravure selectable demoSessionLabel',
			style: 'margin-bottom: 15px; opacity: 0.9; font-size: 0.95em;',
			hidden: !ARSnova.app.globalConfig.demoSessionKey,
			html: Messages.DEMO_SESSION + ARSnova.app.globalConfig.demoSessionKey
		});

		this.demoSessionLabel.element.on('*', function () {
			if (ARSnova.app.globalConfig.demoSessionKey) {
				var controller = arguments[arguments.length - 1];
				if (controller.info.eventName === 'tap') {
					me.sessionInput.setValue(ARSnova.app.globalConfig.demoSessionKey);
				}
			}
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

				items: [this.sessionInput,
					this.demoSessionLabel, {
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
				imageCls: 'icon-cloud',
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
								direction: 'left'
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

		this.initializePaginationVariables();
		this.on('painted', this.onActivate);

		this.on('resize', function () {
			this.resizeSessionButtons();
			this.resizeLastVisitedSessionButtons();
		});
	},

	onActivate: function () {
		var me = this;
		this.resetPaginationState();

		if (ARSnova.app.userRole !== ARSnova.app.USER_ROLE_SPEAKER) {
			var handler = function success(sessions) {
				me.caption.summarize(sessions, {
					questions: true,
					unanswered: false,
					unreadInterposed: false,
					interposed: true,
					answers: true
				});
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
			ARSnova.app.restProxy.getMotdsForStudents({
				success: function (response) {
					var motds = Ext.decode(response.responseText);
					if (motds !== null) {
						ARSnova.app.getController('Motds').showMotds(motds, 1);
					}
				}
			});
		}
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
		ARSnova.app.showLoadIndicator(Messages.LOGIN_LOAD_MASK);

		// delete the textfield-focus, to hide the numeric keypad on phones
		this.down('textfield').blur();

		ARSnova.app.getController('Sessions').login({
			keyword: this.down('textfield').getValue().replace(/ /g, ""),
			destroy: false,
			panel: this
		});
	},

	resizeSessionButtons: function () {
		var buttons = this.mySessionsForm.getInnerItems()[0].getInnerItems();
		var offset = this.mySessionsForm.bodyElement.dom.firstChild.offsetLeft * 2;
		var width = this.element.dom.clientWidth;

		buttons.forEach(function (button) {
			if (width < 720) {
				button.setWidth(width - offset);
			} else {
				button.setWidth('100%');
			}
		});
	},

	resizeLastVisitedSessionButtons: function () {
		var buttons = this.lastVisitedSessionsForm.getInnerItems()[0].getInnerItems();
		var offset = this.lastVisitedSessionsForm.bodyElement.dom.firstChild.offsetLeft * 2;
		var width = this.element.dom.clientWidth;

		buttons.forEach(function (button) {
			if (width < 720) {
				button.setWidth(width - offset);
			} else {
				button.setWidth('100%');
			}
		});
	},

	loadVisitedSessions: function () {
		if (ARSnova.app.userRole === ARSnova.app.USER_ROLE_SPEAKER) {
			return;
		}
		var me = this;
		var promise = new RSVP.Promise();

		var hideLoadingMask = ARSnova.app.showLoadIndicator(Messages.LOAD_MASK_SEARCH);
		ARSnova.app.sessionModel.getMyVisitedSessions(
			me.visitedSessionsObject.getStartIndex(),
			me.visitedSessionsObject.offset, {
			success: function (response) {
				var sessions = Ext.decode(response.responseText);
				me.displaySessions(
					sessions, me.lastVisitedSessionsForm, me.visitedSessionsObject, hideLoadingMask,
					me.loadVisitedSessions
				);
				me.resizeLastVisitedSessionButtons();
				if (sessions.length > 0) {
					promise.resolve(sessions);
				} else {
					promise.reject();
				}
			},
			empty: function () {
				hideLoadingMask();
				me.lastVisitedSessionsForm.hide();
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

		var hideLoadingMask = ARSnova.app.showLoadIndicator(Messages.LOAD_MASK_SEARCH);
		ARSnova.app.sessionModel.getMySessions(
			me.mySessionsObject.getStartIndex(),
			me.mySessionsObject.offset, {
			success: function (response) {
				var sessions = Ext.decode(response.responseText);

				me.displaySessions(
					sessions, me.mySessionsForm, me.mySessionsObject, hideLoadingMask,
					me.loadMySessions
				);
				me.resizeSessionButtons();
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

	displaySessions: function (sessions, form, pageNumObject, hideLoadingMask, callerFn) {
		var me = this;
		if (sessions && sessions.length !== 0) {
			form.removeAll();
			form.show();

			var buttonHandler = function (options) {
				var hideLoadMask = ARSnova.app.showLoadIndicator(Messages.LOAD_MASK_LOGIN);
				ARSnova.app.getController('Sessions').login({
					keyword: options.config.sessionObj.keyword
				});
				hideLoadMask();
			};

			pageNumObject.updatePagination(sessions);
			for (var i = 0; i < pageNumObject.sessions.length; i++) {
				var session = pageNumObject.sessions[i];

				var icon = "icon-users";
				if (session.courseType && session.courseType.length > 0) {
					icon = "icon-prof";
				}

				var iconCls = icon + " courseIcon";

				if (session.sessionType === 'public_pool') {
					iconCls = "icon-cloud";
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

				sessionButton.setBadge([
					{badgeText: session.numInterposed, badgeCls: "feedbackQuestionsBadgeIcon"},
					{badgeText: session.numQuestions, badgeCls: "questionsBadgeIcon"},
					{badgeText: session.numAnswers, badgeCls: "answersBadgeIcon"}
				]);

				form.addEntry(sessionButton);

				if (!session.active) {
					this.down('button[text=' + displaytext + ']').addCls("isInactive");
				}
			}

			if (pageNumObject.offset === -1) {
				form.removeLoadMoreButton();
			} else {
				form.addLoadMoreButton({
					handler: callerFn,
					scope: me
				});
			}
		} else {
			form.hide();
		}
		hideLoadingMask();
	},

	initializePaginationVariables: function () {
		var panel = this;

		var pageNumObject = {
			sessions: [],
			offset: this.listOffset,
			lastOffset: this.listOffset,
			resetOffsetState: function () {
				this.offset = this.lastOffset;
			},
			getStartIndex: function () {
				var length = this.sessions.length;
				return this.offset !== -1 ? length : -1;
			},
			updatePagination: function (sessions) {
				if (Array.isArray(sessions)) {
					var length = sessions.length;
					if (this.offset !== -1 &&
						length > panel.listOffset) {
						length = panel.listOffset;
						sessions.pop();
					} else {
						this.offset = -1;
					}

					this.lastOffset = this.offset;
					this.sessions = this.sessions.concat(sessions);
					this.offset = this.offset !== -1 ?
						this.sessions.length + length : -1;
				}
			}
		};

		this.mySessionsObject = Object.create(pageNumObject);
		this.visitedSessionsObject = Object.create(pageNumObject);
	},

	resetPaginationState: function () {
		this.mySessionsObject.sessions = [];
		this.visitedSessionsObject.sessions = [];
		this.mySessionsObject.resetOffsetState();
		this.visitedSessionsObject.resetOffsetState();
	},

	/**
	 * Save way to set an element hidden.
	 */
	saveSetHidden: function (element, hidden) {
		if (element) {
			element.setHidden(hidden);
		}
	}
});
