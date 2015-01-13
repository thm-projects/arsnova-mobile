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
	           'ARSnova.view.home.SessionExportListPanel',
	           'ARSnova.controller.SessionImport'
	],

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
		
		this.newSessionButtonForm = Ext.create('Ext.Panel', {
			layout: {
				type: 'hbox',
				pack: 'center'
			},

			style: {
				marginTop: '30px'
			},

			items: [
				Ext.create('ARSnova.view.MatrixButton', {
					text: Messages.CREATE_NEW_SESSION,
					buttonConfig: 'icon',
					cls: 'actionButton',
					imageCls: 'icon-newsession thm-green',
					scope: this,
					handler: function (options) {
						var hTP = ARSnova.app.mainTabPanel.tabPanel.homeTabPanel;
						hTP.animateActiveItem(hTP.newSessionPanel, 'slide');
					}
				})
			]
		});

		this.caption = Ext.create('ARSnova.view.Caption', {
			cls: 'x-form-fieldset',
			style: "border-radius: 15px"
		});

		this.sessionsForm = Ext.create('ARSnova.view.home.SessionList', {
			style: 'margin:0 3px',
			scrollable: null,
			title: Messages.MY_SESSIONS
		});

		this.lastVisitedSessionsForm = Ext.create('ARSnova.view.home.SessionList', {
			style: 'margin:0 3px',
			scrollable: null,
			title: Messages.LAST_VISITED_SESSIONS_SPEAKER
		});
		
		this.exportButton = Ext.create('ARSnova.view.MatrixButton', {
			text: 'Export', 
			buttonConfig: 'icon',
			imageCls: 'icon-cloud-download ',
			scope: this,
			hidden: true,
			handler: function () {
				if(Ext.os.is.iOS){
					Ext.Msg.alert(Messages.NOTIFICATION, Messages.EXPORT_IOS_NOTIFICATION);
				}else{
				var hTP = ARSnova.app.mainTabPanel.tabPanel.homeTabPanel;
				hTP.animateActiveItem(hTP.exportSessionListPanel, {
					type: 'slide',
					direction: 'left',
					duration: 700
				});
			  }
			}	
		});
		
		this.importButtonClickable = Ext.create('Ext.ux.Fileup', {
			xtype: 'fileupload',
			autoUpload: true,
			loadAsDataUrl: true,
			baseCls: 'button',
			style: 'background: transparent;position:absolute; width:100%; height: 100%; z-index: 100;border: none !important;font-size:0;',
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
			handler: function(){
				if(Ext.os.is.iOS)
					Ext.Msg.alert(Messages.NOTIFICATION, Messages.IMPORT_IOS_NOTIFICATION);
			},
			listeners: {
				scope: this,
				loadsuccess: function (data) {
					if(!Ext.os.is.iOS){
						var n = data.indexOf("base64,");
						data = decodeURIComponent(escape(atob(data.substring(n+7)))); // remove disturbing prefix
						var hideLoadMask = ARSnova.app.showLoadMask(Messages.IMP_LOADMSK);
						var jsonContent = JSON.parse(data);
						var ctrl = ARSnova.app.getController("SessionImport").importSession(jsonContent.exportData);
						me.loadCreatedSessions();
						hideLoadMask();
					}	
				},
				loadfailure: function (message) {}
			}
		});
		this.importButtonClickable.fileElement.dom.accept = ""; // enable all kinds of data for file input
		
		this.importButton = Ext.create('ARSnova.view.MatrixButton', {
			text: Messages.IMP_BUTTON_IMPORT,
			buttonConfig: 'icon',
			imageCls: 'icon-cloud-upload ',
			scope: this
		});

		this.publicPoolButton = Ext.create('ARSnova.view.MatrixButton', {
			text: 'Pool',
			buttonConfig: 'icon',
			imageCls: 'icon-cloud',
			scope: this,
			handler: function() {
				// get public pool sessions from server
				ARSnova.app.restProxy.getPublicPoolSessions({
					success: function(sessionList) {
						var hTP = ARSnova.app.mainTabPanel.tabPanel.homeTabPanel;
						me.publicPoolPanel = Ext.create('ARSnova.view.home.PublicPoolPanel',{
							sessions: sessionList
						});
						
						hTP.animateActiveItem(me.publicPoolPanel, {
							type: 'slide',
							direction: 'left',
							duration: 700
						});
						
						hideLoadMask();
					},
					empty: function() {
	    				Ext.Msg.alert(Messages.ERROR, Messages.SESSIONPOOL_ERR_GET_NOTFOUND);
	    				hideLoadMask();
	    			},
	    			failure: function() {
	    				Ext.Msg.alert(Messages.ERROR, Messages.SESSIONPOOL_ERR_GET_NOTFOUND);
	    				hideLoadMask();
	    			},
	    			unauthenticated: function() {
	    				Ext.Msg.alert(Messages.ERROR, Messages.SESSIONPOOL_ERR_GET_SESSION);
	    				hideLoadMask();
	    			}
				});
			}
		});
		
		this.importButtonPanel = Ext.create('Ext.Panel', {
			items: [this.importButtonClickable, this.importButton]
		});
		
		this.matrixButtonPanel = Ext.create('Ext.Panel', {
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
			{
				xtype: 'panel',
				cls: null,
				html: 	"<div class='icon-logo'>" +
						"<span class='icon-logo-radar'>r</span>" +
						"<span class='icon-logo-ars'>a</span>" +
						"<span class='icon-logo-nova'>n</span>" +
						"</div>",
				style: {marginTop: '35px', marginBottom: '30px'}
			},
			this.newSessionButtonForm,
			this.sessionsForm,
			this.matrixButtonPanel,
			this.lastVisitedSessionsForm
		]);

		this.onBefore('painted', function () {
			var me = this;
			if (ARSnova.app.userRole == ARSnova.app.USER_ROLE_SPEAKER) {
				var handler = function success(sessions) {
					me.caption.summarize(sessions);
					me.add(me.caption);
				};
				var p1 = this.loadCreatedSessions();
				var p2 = this.loadVisitedSessions();
				// get the summary of all session lists
				RSVP.all([p1, p2]).then(handler, function error() {
					// errors swallow results, retest each promise seperately to figure out if one succeeded
					p1.then(handler);
					p2.then(handler);
				});
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
		var promise = new RSVP.Promise();

		var hideLoadMask = ARSnova.app.showLoadMask(Messages.LOAD_MASK_SEARCH);
		ARSnova.app.sessionModel.getMySessions({
			success: function (response) {
				var sessions = Ext.decode(response.responseText);
				var panel = ARSnova.app.mainTabPanel.tabPanel.homeTabPanel.mySessionsPanel;
				var caption = panel.caption;

				panel.sessionsForm.removeAll();
				panel.sessionsForm.show();
				
				if(sessions.length > 0){
					me.exportButton.setHidden(false);
				}
								
				var session;
				for (var i = 0, session; session = sessions[i]; i++) {
					
					var status = "";
					var course = "icon-presenter";

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
							console.log("Test");
							var hideLoadMask = ARSnova.app.showLoadMask(Messages.LOAD_MASK_LOGIN);
							localStorage.setItem('role', ARSnova.app.USER_ROLE_SPEAKER);
							ARSnova.app.setWindowTitle();
							
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

				hideLoadMask();
				promise.resolve(sessions);
			},
			empty: Ext.bind(function () {
				hideLoadMask();
				this.sessionsForm.hide();
				me.exportButton.setHidden(true);	
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
				console.log("my sessions request failure");
				promise.reject();
			}
		}, (window.innerWidth > 481 ? 'name' : 'shortname'));
		return promise;
	},

	loadVisitedSessions: function () {
		var me = this;
		var hideLoadingMask = ARSnova.app.showLoadMask(Messages.LOAD_MASK_SEARCH);
		var promise = new RSVP.Promise();

		ARSnova.app.restProxy.getMyVisitedSessions({
			success: function (sessions) {
				var panel = me;
				var caption = panel.caption;

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
					promise.resolve(sessions);
				} else {
					panel.lastVisitedSessionsForm.hide();
					promise.reject();
				}
				hideLoadingMask();
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
				me.lastVisitedSessionsForm.hide();
				promise.reject();
			}
		}, (window.innerWidth > 481 ? 'name' : 'shortname'));
		return promise;
	}
});
