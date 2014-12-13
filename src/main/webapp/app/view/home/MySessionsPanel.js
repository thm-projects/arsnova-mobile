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
Ext.define('ARSnova.view.home.MySessionsPanel', {
	extend: 'Ext.Panel',

	requires: [
	           'ARSnova.view.Caption', 
	           'ARSnova.view.home.SessionList', 
	           'Ext.ux.Fileup', 
	           'ARSnova.view.speaker.ExportSessionPanel',
	           'ARSnova.controller.SessionImport'],

	config: {
		fullscreen: true,
		scrollable: {
			direction: 'vertical',
			directionLock: true
		}
	},

	/* toolbar items */
	toolbar: null,
	backButton: null,

	/* items */
	createdSessions: null,

	initialize: function () {
		this.callParent(arguments);
		
		var me = this;

		this.logoutButton = Ext.create('Ext.Button', {
			text: Messages.LOGOUT,
			ui: 'back',
			hidden: true,
			handler: function () {
				ARSnova.app.getController('Auth').logout();
			}
		});

		this.backButton = Ext.create('Ext.Button', {
			text: Messages.HOME,
			ui: 'back',
			handler: function () {
				var hTP = ARSnova.app.mainTabPanel.tabPanel.homeTabPanel;
				hTP.animateActiveItem(hTP.homePanel, {
					type: 'slide',
					direction: 'right',
					duration: 700
				});
			}
		});

		this.toolbar = Ext.create('Ext.Toolbar', {
			title: Messages.SESSIONS,
			cls: 'speakerTitleText',
			docked: 'top',
			ui: 'light',
			items: [
				this.backButton,
				this.logoutButton
			]
		});

		this.newSessionButtonForm = Ext.create('Ext.form.FormPanel', {
			cls: 'topPadding standardForm',
			style: 'margin: 5px 12px',
			scrollable: null,

			items: [{
				xtype: 'button',
				ui: 'normal',
				text: Messages.CREATE_NEW_SESSION,
				cls: 'forwardListButton',
				handler: function (options) {
					var hTP = ARSnova.app.mainTabPanel.tabPanel.homeTabPanel;
					hTP.animateActiveItem(hTP.newSessionPanel, 'slide');
				}
			}]
		});

		this.sessionsForm = Ext.create('ARSnova.view.home.SessionList', {
			style: 'margin:0 3px',
			scrollable: null,
			title: Messages.MY_SESSIONS
		});

		this.lastVisitedSessionsForm = Ext.create('ARSnova.view.home.SessionList', {
			style: 'margin:0 3px',
			scrollable: null,
			title: Messages.LAST_VISITED_SESSIONS
		});
		
		this.publicPoolPanel = Ext.create('ARSnova.view.home.PublicPoolPanel');
		
		this.exportButton = Ext.create('ARSnova.view.MatrixButton', {
			text: 'Export', //Hier in internationalization hinzufuegen
			buttonConfig: 'icon',
			imageCls: 'icon-download2 thm-darkblue',
			scope: this,
			handler: function () {
				var hTP = ARSnova.app.mainTabPanel.tabPanel.homeTabPanel;
				this.exportSessionPanel = Ext.create('ARSnova.view.speaker.ExportSessionPanel');
				hTP.animateActiveItem(hTP.mySessionsPanel, {
					type: 'slide',
					direction: 'left',
					duration: 700
				});
				hTP.setActiveItem(this.exportSessionPanel);
			}
		});
		
		this.importButtonClickable = Ext.create('Ext.ux.Fileup', {
			xtype: 'fileupload',
			autoUpload: true,
			loadAsDataUrl: true,
			buttonConfig: 'icon',
			imageCls: 'icon-upload2 thm-orange',
			style: 'background: transparent!important;position:absolute; width:100%; height: 100%; z-index: 100;border: none !important;font-size:0;',
			states: {
				browse: {
					text: "Suchen"
				},
				ready: {
					text: Messages.LOAD
				},
				uploading: {
					text: Messages.LOADING,
					loading: true
				}
			},
			listeners: {
				scope: this,
				loadsuccess: function (data) {
					data = atob(data.substring(13)); // remove disturbing prefix
					var hideLoadMask = ARSnova.app.showLoadMask(Messages.IMP_LOADMSK);
					var ctrl = ARSnova.app.getController("SessionImport").importSession(JSON.parse(data));
					
					hideLoadMask();
				},
				loadfailure: function (message) {}
			}
		});
		this.importButtonClickable.fileElement.dom.accept = ""; // enable all kinds of data for file input
		
		this.importButton = Ext.create('ARSnova.view.MatrixButton', {
			text: Messages.IMP_BUTTON_IMPORT,
			buttonConfig: 'icon',
			imageCls: 'icon-upload2 thm-orange',

			scope: this,
		});
		
		this.importButtonPanel = Ext.create('Ext.Panel', {
			items: [this.importButtonClickable, this.importButton]
		});
		
		this.publicPoolButton = Ext.create('ARSnova.view.MatrixButton', {
			text: 'Pool', //Hier in internationalization hinzufuegen
			buttonConfig: 'icon',
			imageCls: 'icon-cloud',
			scope: this,
			handler: function() {
				var hTP = ARSnova.app.mainTabPanel.tabPanel.homeTabPanel;
				hTP.animateActiveItem(me.publicPoolPanel, {
					type: 'slide',
					direction: 'left',
					duration: 700
				});
			}
		});
		
		this.matrixButtonPanel = Ext.create('Ext.Panel', {
			style: {marginTop: '20px'},
			layout: {
				type: 'hbox',
				pack: 'center'
			},
			items: [
				this.exportButton,
				this.importButtonPanel,
				this.publicPoolButton
			]
		});

		this.add([
			this.toolbar,
			this.newSessionButtonForm,
			this.sessionsForm,
			this.lastVisitedSessionsForm,
			this.matrixButtonPanel
		]);

		this.onBefore('painted', function () {
			if (ARSnova.app.userRole == ARSnova.app.USER_ROLE_SPEAKER) {
				this.loadCreatedSessions();
				this.loadVisitedSessions();
			}
		});

		this.on('activate', function () {
			switch (ARSnova.app.userRole) {
				case ARSnova.app.USER_ROLE_SPEAKER:
					this.backButton.hide();
					this.logoutButton.show();
					break;
				default:
				break;
			}

			if (ARSnova.app.loginMode == ARSnova.app.LOGIN_THM) {
				this.logoutButton.addCls('thm');
			}
		});
	},

	loadCreatedSessions: function () {
		var me = this;

		var hideLoadMask = ARSnova.app.showLoadMask(Messages.LOAD_MASK_SEARCH);
		ARSnova.app.sessionModel.getMySessions({
			success: function (response) {
				var sessions = Ext.decode(response.responseText);
				var panel = ARSnova.app.mainTabPanel.tabPanel.homeTabPanel.mySessionsPanel;
				var caption = Ext.create('ARSnova.view.Caption');

				panel.sessionsForm.removeAll();
				panel.sessionsForm.show();

				var session;
				for (var i = 0, session; session = sessions[i]; i++) {
					var status = "";
					var course = "icon-radar";

					if (!session.active) {
						status = " isInactive";
					}

					if (session.courseType && session.courseType.length > 0) {
						course = "icon-prof";
					}

					// Minimum width of 321px equals at least landscape view
					var displaytext = window.innerWidth > 481 ? session.name : session.shortName;
					var sessionButton = Ext.create('ARSnova.view.MultiBadgeButton', {
						ui: 'normal',
						text: Ext.util.Format.htmlEncode(displaytext),
						iconCls: course + " courseIcon",
						cls: 'forwardListButton' + status,
						sessionObj: session,
						handler: function (options) {
							console.log(options.config.sessionObj);
							var hideLoadMask = ARSnova.app.showLoadMask(Messages.LOAD_MASK_LOGIN);
							ARSnova.app.getController('Auth').roleSelect({
								mode: ARSnova.app.USER_ROLE_SPEAKER
							});
							ARSnova.app.getController('Sessions').login({
								keyword: options.config.sessionObj.keyword
							});
							hideLoadMask();
						}
					});
					sessionButton.setBadge([
						{badgeText: session.numInterposed, badgeCls: "feedbackQuestionsBadgeIcon"},
						{badgeText: session.numQuestions, badgeCls: "questionsBadgeIcon"},
						{badgeText: session.numAnswers, badgeCls: "answersBadgeIcon"}
					]);
					panel.sessionsForm.addEntry(sessionButton);
				}
				caption.explainBadges(sessions);
				caption.explainStatus(sessions);

				panel.sessionsForm.addEntry(caption);
				hideLoadMask();
			},
			empty: Ext.bind(function () {
				hideLoadMask();
				this.sessionsForm.hide();
			}, this),
			unauthenticated: function () {
				hideLoadMask();
				ARSnova.app.getController('Auth').login({
					mode: ARSnova.app.loginMode
				});
			},
			failure: function () {
				hideLoadMask();
				console.log("my sessions request failure");
			}
		}, (window.innerWidth > 481 ? 'name' : 'shortname'));
	},

	loadVisitedSessions: function () {
		var me = this;
		var hideLoadingMask = ARSnova.app.showLoadMask(Messages.LOAD_MASK_SEARCH);

		ARSnova.app.restProxy.getMyVisitedSessions({
			success: function (sessions) {
				var panel = me;
				var caption = Ext.create('ARSnova.view.Caption');

				if (sessions && sessions.length !== 0) {
					panel.lastVisitedSessionsForm.removeAll();
					panel.lastVisitedSessionsForm.show();

					for (var i = 0; i < sessions.length; i++) {
						var session = sessions[i];

						var icon = "icon-users";
						if (session.creator === localStorage.getItem("login")) {
							continue;
						}
						if (session.courseType && session.courseType.length > 0) {
							icon = "icon-prof";
						}

						// Minimum width of 481px equals at least landscape view
						var displaytext = window.innerWidth > 481 ? session.name : session.shortName;
						var sessionButton = Ext.create('ARSnova.view.MultiBadgeButton', {
							xtype: 'button',
							ui: 'normal',
							text: Ext.util.Format.htmlEncode(displaytext),
							cls: 'forwardListButton',
							iconCls: icon + ' courseIcon',
							controller: 'sessions',
							action: 'showDetails',
							badgeCls: 'badgeicon',
							sessionObj: session,
							handler: function (options) {
								var hideLoadMask = ARSnova.app.showLoadMask(Messages.LOAD_MASK_LOGIN);
								ARSnova.app.getController('Auth').roleSelect({
									mode: ARSnova.app.USER_ROLE_STUDENT
								});
								ARSnova.app.getController('Sessions').login({
									keyword: options.config.sessionObj.keyword
								});
								hideLoadMask();
							}
						});
						sessionButton.setBadge([{badgeText: session.numUnanswered, badgeCls: "questionsBadgeIcon"}]);
						panel.lastVisitedSessionsForm.addEntry(sessionButton);

						if (!session.active) {
							panel.down('button[text=' + displaytext + ']').addCls("isInactive");
						}
					}
					caption.explainBadges(sessions, { questions: false, answers: false, interposed: false, unanswered: true });
					caption.explainStatus(sessions);
					panel.lastVisitedSessionsForm.addEntry(caption);
				} else {
					panel.lastVisitedSessionsForm.hide();
				}
				hideLoadingMask();
			},
			unauthenticated: function () {
				hideLoadingMask();
				ARSnova.app.getController('Auth').login({
					mode: ARSnova.app.loginMode
				});
			},
			failure: function () {
				hideLoadingMask();
				console.log('server-side error loggedIn.save');
				me.lastVisitedSessionsForm.hide();
			}
		}, (window.innerWidth > 481 ? 'name' : 'shortname'));
	},
	
	showPublicPool: function() {
		var hTP = ARSnova.app.mainTabPanel.tabPanel.homeTabPanel;
		hTP.animateActiveItem(this.publicPoolPanel, 'slide');
	}
});
