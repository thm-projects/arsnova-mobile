/*--------------------------------------------------------------------------+
 This file is part of ARSnova.
 app/speaker/inClass.js
 - Beschreibung: Startseite für Session-Inhaber.
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
Ext.define('ARSnova.view.speaker.InClass', {
	extend: 'Ext.Panel',

	requires: ['ARSnova.view.MultiBadgeButton',
	           'ARSnova.view.SessionStatusButton'],

	config: {
		fullscreen: true,
		title	: Messages.FEEDBACK,
		iconCls	: 'feedbackMedium',
		scrollable: 'vertical'
	},

	inClassItems			: null,

	inClassActions: null,
	sessionStatusButton			: null,
	createAdHocQuestionButton	: null,

	/**
	 * count every x seconds all actually logged-in users for this sessions
	 */
	countActiveUsersTask: {
		name: 'count the actually logged in users',
		run: function(){
			ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel.inClassPanel.countActiveUsers();
		},
		interval: 15000
	},

	/**
	 * task for speakers in a session
	 * count every x seconds the number of feedback questions
	 */
	countFeedbackQuestionsTask: {
		name: 'count feedback questions',
		run: function(){
			ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel.inClassPanel.countFeedbackQuestions();
		},
		interval: 15000
	},

	courseLearningProgressTask: {
		name: 'get the students learning progress',
		run: function(){
			ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel.inClassPanel.courseLearningProgress();
		},
		interval: 15000
	},

	initialize: function(){
		this.callParent(arguments);

		var comingSoon = function(component) {
			var comingSoonPanel = Ext.create('Ext.Panel', {
				top: -1000,
				html: "<div style='padding: 0.5em'>"+Messages.FEATURE_COMING_SOON+"</div>"
			});
			comingSoonPanel.showBy(component, 'tc-bc');
			Ext.defer(function() {
				comingSoonPanel.destroy();
			}, 2000);
		};

		var loggedInCls = '';
		if (ARSnova.app.loginMode == ARSnova.app.LOGIN_THM) {
			loggedInCls = 'thm';
		}

		this.sessionLogoutButton = Ext.create('Ext.Button', {
			text	: Messages.SESSIONS,
			ui		: 'back',
			cls		: loggedInCls,
			handler	: function() {
				ARSnova.app.getController('Sessions').logout();
			}
		});

		this.presenterButton = Ext.create('Ext.Button', {
			cls		: "thm",
			text	: Messages.PRESENTER,
			hidden	: true,
			scope	: this,
			handler	: this.presenterHandler
		});

		this.toolbar = Ext.create('Ext.Toolbar', {
			title: Ext.util.Format.htmlEncode(localStorage.getItem("shortName")),
			ui: 'light',
			docked: 'top',
			items: [
		        this.sessionLogoutButton,
		        {xtype: 'spacer'},
		        this.presenterButton
			]
		});

		this.feedbackButton = Ext.create('ARSnova.view.MultiBadgeButton', {
			text		: Messages.LIVE_FEEDBACK,
			cls			: 'forwardListButton',
			badgeCls	: 'badgeicon feedbackARSnova',
			handler		: function() {
				var tabPanel = ARSnova.app.mainTabPanel.tabPanel;
				tabPanel.setActiveItem(tabPanel.feedbackTabPanel, "slide");
			}
		});

		this.preparationQuestionButton = Ext.create('ARSnova.view.MultiBadgeButton', {
			text		: Messages.PREPARATION_QUESTIONS,
			cls			: 'forwardListButton',
			controller	: 'PreparationQuestions',
			action		: 'listQuestions',
			handler		: this.buttonClicked
		});

		this.lectureQuestionButton = Ext.create('ARSnova.view.MultiBadgeButton', {
			text		: Messages.LECTURE_QUESTIONS,
			cls			: 'forwardListButton',
			controller	: 'Questions',
			action		: 'listQuestions',
			handler		: this.buttonClicked
		});

		this.feedbackQuestionButton = Ext.create('ARSnova.view.MultiBadgeButton', {
			ui			: 'normal',
			text		: Messages.QUESTIONS_FROM_STUDENTS,
			cls			: 'forwardListButton',
			controller	: 'Questions',
			action		: 'listFeedbackQuestions',
			handler		: this.buttonClicked
		});

		this.flashcardsButton = Ext.create('ARSnova.view.MultiBadgeButton', {
			text		: Messages.FLASHCARDS,
			cls			: 'forwardListButton',
			controller	: 'FlashcardQuestions',
			action		: 'listQuestions',
			handler		: this.buttonClicked
		});

		this.courseLearningProgressButton = Ext.create('ARSnova.view.MultiBadgeButton', {
			text		: Messages.COURSES_LEARNING_PROGRESS,
			cls			: 'answerListButton'
		});

		this.inClassItems = Ext.create('Ext.form.FormPanel', {
			scrollable: null,

			items: [{
				cls: 'gravure',
				style: 'padding:15px 0 0',
				html: Messages.SESSION_ID + ": " + ARSnova.app.formatSessionID(localStorage.getItem("keyword"))
			}, {
				xtype: 'formpanel',
				cls	 : 'standardForm topPadding',
				scrollable: null,

				items: [
					this.feedbackButton,
					this.feedbackQuestionButton,
					this.lectureQuestionButton,
					this.preparationQuestionButton,
					this.courseLearningProgressButton
				]
			}]
		});

		this.sessionStatusButton = Ext.create('ARSnova.view.SessionStatusButton');

		this.createAdHocQuestionButton = Ext.create('ARSnova.view.MatrixButton', {
			text		: Messages.AH_HOC_QUESTION,
			image		: 'question',
			controller	: 'Questions',
			action		: 'adHoc',
			handler		: this.buttonClicked
		});

		this.deleteSessionButton = Ext.create('ARSnova.view.MatrixButton', {
			text: Messages.DELETE_SESSION,
			image: 'delete_session',
			scope	: this,
			handler	: function(){
				var msg = Messages.ARE_YOU_SURE +
						"<br>" + Messages.DELETE_SESSION_NOTICE;
				Ext.Msg.confirm(Messages.DELETE_SESSION, msg, function(answer){
					if (answer == 'yes') {
						ARSnova.app.showLoadMask(Messages.LOAD_MASK_SESSION_DELETE);
						ARSnova.app.sessionModel.destroy(localStorage.getItem('keyword'), {
							success: function(){
								ARSnova.app.removeVisitedSession(localStorage.getItem('sessionId'));
								ARSnova.app.mainTabPanel.tabPanel.on('activeitemchange', function(){
									ARSnova.app.mainTabPanel.tabPanel.homeTabPanel.mySessionsPanel.loadCreatedSessions();
								}, this, {single:true});
								ARSnova.app.getController('Sessions').logout();
							},
							failure: function(response){
								console.log('server-side error delete session');
							}
						});
					}
				});
			}
		});

		this.inClassActions = Ext.create('Ext.Panel', {
			style	: { marginTop: '20px' },
			layout  : {
				type: 'hbox',
				pack: 'center'
			},

			items: [
			    this.createAdHocQuestionButton,
			    this.sessionStatusButton,
			    this.deleteSessionButton
	        ]

		});

		this.add([this.toolbar, this.inClassItems, this.inClassActions]);

		this.on('initialize', function() {
			this.feedbackButton.setBadge([{ badgeText: '0' }]);
		});

		this.on('activate', function() {
			ARSnova.app.feedbackModel.on("arsnova/session/feedback/average", this.updateFeedback, this);
			this.displayPresenterButton();
		});
		this.on('deactivate', function() {
			ARSnova.app.feedbackModel.un("arsnova/session/feedback/average", this.updateFeedback);
		});

		this.on('destroy', this.destroyListeners);

		this.onBefore('painted', function(){
			this.updateBadges();
		});
	},

	updateFeedback: function(averageFeedback) {
		var feedbackCls;
		switch (averageFeedback) {
			/* 0: faster, please!; 1: can follow; 2: to fast!; 3: you have lost me */
			case 0:
				feedbackCls = "Medium";
				break;
			case 1:
				feedbackCls = "Good";
				break;
			case 2:
				feedbackCls = "Bad";
				break;
			case 3:
				feedbackCls = "None";
				break;
			default:
				feedbackCls = "ARSnova";
				break;
		}
		this.feedbackButton.setBadge([{
			badgeText: "0",
			badgeCls: 'badgeicon feedback' + feedbackCls
		}]);
	},

	buttonClicked: function(button){
		ARSnova.app.getController(button.config.controller)[button.config.action]();
	},

	/* will be called on session login */
	registerListeners: function(){
		var inClassPanel = ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel.inClassPanel;
		taskManager.start(inClassPanel.countActiveUsersTask);
		taskManager.start(inClassPanel.countFeedbackQuestionsTask);
		taskManager.start(inClassPanel.courseLearningProgressTask);
	},

	/* will be called on session logout */
	destroyListeners: function(){
		var inClassPanel = ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel.inClassPanel;
		taskManager.stop(inClassPanel.countActiveUsersTask);
		taskManager.stop(inClassPanel.countFeedbackQuestionsTask);
		taskManager.stop(inClassPanel.courseLearningProgressTask);
	},

	updateBadges: function(){
		var panel = ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel.inClassPanel;
		panel.updateAudienceQuestionBadge();
	},

	updateAudienceQuestionBadge: function() {
		var failureCallback = function() {
			console.log('server-side error');
		};

		ARSnova.app.questionModel.countLectureQuestions(localStorage.getItem("keyword"), {
			success: function(response) {
				var numQuestions = parseInt(response.responseText);
				ARSnova.app.questionModel.countLectureQuestionAnswers(localStorage.getItem("keyword"), {
					success: function(response) {
						var numAnswers = parseInt(response.responseText);

						var panel = ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel.inClassPanel;

						panel.lectureQuestionButton.setBadge([
											{badgeText: numQuestions, badgeCls: "greybadgeicon"},
											{badgeText: numAnswers, badgeCls: "redbadgeicon"}
										]);
					},
					failure: failureCallback
				});
			},
			failure: failureCallback
		});
		ARSnova.app.questionModel.countPreparationQuestions(localStorage.getItem("keyword"), {
			success: function(response) {
				var numQuestions = parseInt(response.responseText);
				ARSnova.app.questionModel.countPreparationQuestionAnswers(localStorage.getItem("keyword"), {
					success: function(response) {
						var numAnswers = parseInt(response.responseText);

						var panel = ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel.inClassPanel;

						panel.preparationQuestionButton.setBadge([
											{badgeText: numQuestions, badgeCls: "greybadgeicon"},
											{badgeText: numAnswers, badgeCls: "redbadgeicon"}
										]);
					},
					failure: failureCallback
				});
			},
			failure: failureCallback
		});
		ARSnova.app.questionModel.countFlashcards(localStorage.getItem("keyword"), {
			success: function(response) {
				var numQuestions = parseInt(response.responseText);
				var panel = ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel.inClassPanel;
				panel.flashcardsButton.setBadge([{badgeText: numQuestions, badgeCls: "greybadgeicon"}]);
			},
			failure: failureCallback
		});
	},

	countActiveUsers: function(){
		ARSnova.app.loggedInModel.countActiveUsersBySession(localStorage.getItem("keyword"), {
			success: function(response){
				var value = parseInt(response.responseText);
				if (value > 0) {
					// Do not count myself ;-)
					value--;
				}
			},
			failure: function(){
				console.log('server-side error');
			}
		});
	},

	countFeedbackQuestions: function(){
		ARSnova.app.questionModel.countFeedbackQuestions(localStorage.getItem("keyword"), {
			success: function(response){
				var questionCount = Ext.decode(response.responseText);
				ARSnova.app.mainTabPanel.tabPanel.feedbackQuestionsPanel.tab.setBadgeText(questionCount.unread);

				var feedbackQButton = ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel.inClassPanel.feedbackQuestionButton;
				feedbackQButton.setBadge([{badgeText: questionCount.total, badgeCls: "bluebadgeicon"}]);
			},
			failure: function(){
				console.log('server-side error');
			}
		});
	},

	courseLearningProgress: function() {
		var me = this;
		ARSnova.app.sessionModel.getCourseLearningProgress(localStorage.getItem("keyword"), {
			success: function(response) {
				var p = Ext.decode(response.responseText);
				if (p >= 75) {
					me.courseLearningProgressButton.setBadge([{ badgeText: p+"%", badgeCls: "greenbadgeicon" }]);
				} else if (p >= 25) {
					me.courseLearningProgressButton.setBadge([{ badgeText: p+"%", badgeCls: "yellowbadgeicon" }]);
				} else {
					me.courseLearningProgressButton.setBadge([{ badgeText: p+"%", badgeCls: "redbadgeicon" }]);
				}
			},
			failure: function() {
				me.courseLearningProgressButton.setBadge([{ badgeText: "" }]);
			}
		});
	},

	presenterHandler: function() {
		window.open(ARSnova.app.PRESENTER_URL + "#!/" + localStorage.getItem('keyword'), "_self");
	},

	/**
	 * Displays the showcase button if enough screen width is available
	 */
	displayPresenterButton: function() {
		/* iPad does not swap screen width and height values in landscape orientation */
		if (screen.availWidth >= 980 || screen.availHeight >= 980) {
			this.presenterButton.show();
		} else if (window.innerWidth >= 480) {
			this.presenterButton.hide();
		} else {
			this.presenterButton.hide();
		}
	},

	onOrientationChange: function(panel, orientation, width, height) {
		this.displayPresenterButton();
	}
});
