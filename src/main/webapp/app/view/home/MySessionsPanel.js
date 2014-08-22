/*--------------------------------------------------------------------------+
 This file is part of ARSnova.
 app/home/mySessionsPanel.js
 - Beschreibung: Startseite für User in der Rolle "Dozent/in".
 - Version:      1.0, 01/05/12
 - Autor(en):    Christian Thomas Weber <christian.t.weber@gmail.com>
 +---------------------------------------------------------------------------+
 This program is free software; you can redistribute it and/or
 modify it under the terms of the GNU General Public License
 as published by the Free Software Foundation; either version 2
 of the License, or any later version.
 +---------------------------------------------------------------------------+
 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.
 You should have received a copy of the GNU General Public License
 along with this program; if not, write to the Free Software
 Foundation, Inc., 59 Temple Place - Suite 330, Boston, MA  02111-1307, USA.
 +--------------------------------------------------------------------------*/
Ext.define('ARSnova.view.home.MySessionsPanel', {
	extend: 'Ext.Panel',
	
	requires: ['ARSnova.view.Caption', 'ARSnova.view.home.SessionList'],

	config: {
		fullscreen: true,
		scrollable: {
			direction: 'vertical',
			directionLock: true
		}
	},
	
	/* toolbar items */
	toolbar		: null,
	backButton	: null,
	
	/* items */
	createdSessions: null,
	
	initialize: function() {
		this.callParent(arguments);
		
		this.logoutButton = Ext.create('Ext.Button', {
			text	: Messages.LOGOUT,
			ui		: 'back',
			hidden	: true,
			handler	: function() {
				ARSnova.app.getController('Auth').logout();
			}
		});
		
		this.backButton = Ext.create('Ext.Button', {
			text	: Messages.HOME,
			ui		: 'back',
			handler	: function() {
				var hTP = ARSnova.app.mainTabPanel.tabPanel.homeTabPanel;
				hTP.animateActiveItem(hTP.homePanel, {
					type		: 'slide',
					direction	: 'right',
					duration	: 700
				});
			}
		});
		
		this.toolbar = Ext.create('Ext.Toolbar', {
			title: Messages.SESSIONS,
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
				xtype	: 'button',
				ui		: 'normal',
				text	: Messages.CREATE_NEW_SESSION,
				cls		: 'forwardListButton',
				handler	: function(options){
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
		
		this.add([
		    this.toolbar,
		    this.newSessionButtonForm,
            this.sessionsForm,
            this.lastVisitedSessionsForm
        ]);
		
		this.onBefore('painted', function() {
			if(ARSnova.app.userRole == ARSnova.app.USER_ROLE_SPEAKER) {
				this.loadCreatedSessions();
				this.loadVisitedSessions();
			}
		});
		
		this.on('activate', function() {
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
	
	loadCreatedSessions: function() {
		var me = this;

		var hideLoadMask = ARSnova.app.showLoadMask(Messages.LOAD_MASK_SEARCH);
		ARSnova.app.sessionModel.getMySessions({
			success: function(response) {
				var sessions = Ext.decode(response.responseText);
				var panel = ARSnova.app.mainTabPanel.tabPanel.homeTabPanel.mySessionsPanel;
				var caption = Ext.create('ARSnova.view.Caption');
				
				panel.sessionsForm.removeAll();
				panel.sessionsForm.show();
				
				var badgePromises = [];
				
				for ( var i = 0, session; session = sessions[i]; i++) {
					var status = "";
					var course = " defaultsession";

					if (!session.active) {
						status = " isInactive";
					}

					if (session.courseType && session.courseType.length > 0) {
						course = " coursesession";
					}

					// Minimum width of 321px equals at least landscape view
					var displaytext = window.innerWidth > 481 ? session.name : session.shortName; 
					var sessionButton = Ext.create('ARSnova.view.MultiBadgeButton', {
						ui			: 'normal',
						text		: Ext.util.Format.htmlEncode(displaytext),
						cls			: 'forwardListButton' + status + course,
						sessionObj	: session,
						handler		: function(options){
							var hideLoadMask = ARSnova.app.showLoadMask(Messages.LOAD_MASK_LOGIN);
							ARSnova.app.getController('Auth').roleSelect({
								mode: ARSnova.app.USER_ROLE_SPEAKER
							});
							ARSnova.app.getController('Sessions').login({
								keyword		: options.config.sessionObj.keyword
							});
							hideLoadMask();
						}
					});
					badgePromises.push(me.updateBadges(session.keyword, sessionButton));
					panel.sessionsForm.addEntry(sessionButton);
				}
				RSVP.all(badgePromises).then(Ext.bind(caption.explainBadges, caption));
				caption.explainStatus(sessions);
				
				panel.sessionsForm.addEntry(caption);
				hideLoadMask();
    		},
			empty: Ext.bind(function() {
				hideLoadMask();
				this.sessionsForm.hide();
			}, this),
			unauthenticated: function() {
				hideLoadMask();
				ARSnova.app.getController('Auth').login({
					mode: ARSnova.app.loginMode
				});
			},
    		failure: function() {
    			hideLoadMask();
    			console.log("my sessions request failure");
    		}
    	}, (window.innerWidth > 481 ? 'name' : 'shortname'));
	},
	
	loadVisitedSessions: function() {
		var me = this;
		var hideLoadingMask = ARSnova.app.showLoadMask(Messages.LOAD_MASK_SEARCH);
		
		ARSnova.app.restProxy.getMyVisitedSessions({
			success: function(sessions) {
				var panel = me;
				var caption = Ext.create('ARSnova.view.Caption');

				var badgePromises = [];

				if (sessions && sessions.length !== 0) {
					panel.lastVisitedSessionsForm.removeAll();
					panel.lastVisitedSessionsForm.show();

					for ( var i = 0; i < sessions.length; i++) {
						var session = sessions[i];

						var icon = " studentsession";
						if (session.creator === localStorage.getItem("login")) {
							continue;
						}
						if (session.courseId && session.courseId.length > 0) {
							icon = " coursesession";
						}
						
						// Minimum width of 481px equals at least landscape view
						var displaytext = window.innerWidth > 481 ? session.name : session.shortName; 
						var sessionButton = Ext.create('ARSnova.view.MultiBadgeButton', {
							xtype		: 'button',
							ui			: 'normal',
							text		: Ext.util.Format.htmlEncode(displaytext),
							cls			: 'forwardListButton' + icon,
							controller	: 'sessions',
							action		: 'showDetails',
							badgeCls	: 'badgeicon',
							sessionObj	: session,
							handler		: function(options){
								var hideLoadMask = ARSnova.app.showLoadMask(Messages.LOAD_MASK_LOGIN);
								ARSnova.app.getController('Auth').roleSelect({
									mode: ARSnova.app.USER_ROLE_STUDENT
								});
								ARSnova.app.getController('Sessions').login({
									keyword		: options.config.sessionObj.keyword
								});
								hideLoadMask();
							}
						});
						panel.lastVisitedSessionsForm.addEntry(sessionButton);
						badgePromises.push(panel.updateQuestionBadge(session.keyword, sessionButton));
						
						if (!session.active) {
							panel.down('button[text=' + displaytext + ']').addCls("isInactive");
						}
					}
					RSVP.all(badgePromises).then(Ext.bind(caption.explainBadges, caption));
					caption.explainStatus(sessions);
					panel.lastVisitedSessionsForm.addEntry(caption);
				} else {
					panel.lastVisitedSessionsForm.hide();
				}
				hideLoadingMask();
			},
			unauthenticated: function() {
				hideLoadingMask();
				ARSnova.app.getController('Auth').login({
					mode: ARSnova.app.loginMode
				});
			},
			failure: function() {
				hideLoadingMask();
				console.log('server-side error loggedIn.save');
				me.lastVisitedSessionsForm.hide();
			}
		}, (window.innerWidth > 481 ? 'name' : 'shortname'));
	},
	
	updateBadges: function(sessionKeyword, button) {
		var promise = new RSVP.Promise();
		
		var failureCallback = function() {
			console.log('server-side error: ', arguments);
			promise.reject();
		};
		
		this.getQuestionCount(sessionKeyword).then(function(numQuestions) {
			ARSnova.app.questionModel.countTotalAnswers(sessionKeyword, {
				success: function(response) {
					var numAnswers = parseInt(response.responseText);
					ARSnova.app.questionModel.countFeedbackQuestions(sessionKeyword, {
						success: function(response) {
							var numFeedbackQuestions = Ext.decode(response.responseText).total;
							
							button.setBadge([
							                 {badgeText: numFeedbackQuestions, badgeCls: "bluebadgeicon"},
							                 {badgeText: numQuestions, badgeCls: "greybadgeicon"},
							                 {badgeText: numAnswers, badgeCls: "redbadgeicon"}
							                 ]);
							
							promise.resolve({
								hasFeedbackQuestions: numFeedbackQuestions > 0,
								hasQuestions: numQuestions > 0,
								hasAnswers: numAnswers > 0
							});
						},
						failure: failureCallback
					});
				},
				failure: failureCallback
			});
		});
		
		return promise;
	},
	
	getQuestionCount: function(sessionKeyword) {
		var promise = new RSVP.Promise();
		ARSnova.app.questionModel.countSkillQuestions(sessionKeyword, {
			success: function(response) {
				promise.resolve(parseInt(response.responseText));
			},
			failure: function() {
				promise.reject();
			}
		});
		return promise;
	},
	
	updateQuestionBadge: function(sessionKeyword, button) {
		return this.getQuestionCount(sessionKeyword).then(function(numQuestions) {
			button.setBadge([{badgeText: numQuestions, badgeCls: "greybadgeicon"}]);
			return numQuestions;
		});
	}
});
