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
Ext.define('ARSnova.view.user.InClass', {
	extend: 'Ext.Panel',

	requires: ['ARSnova.view.MultiBadgeButton'],

	config: {
		title: 'InClass',
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

	inClass: null,
	feedbackButton: null,
	quizButton: null,

	checkLearningProgressTask: {
		name: 'check if my progress has changed',
		run: function () {
			ARSnova.app.mainTabPanel.tabPanel.userTabPanel.inClassPanel.checkLearningProgress();
		},
		interval: 20000
	},

	/**
	* count every x seconds the number of feedback questions
	*/
	countFeedbackQuestionsTask: {
		name: 'count feedback questions',
		run: function () {
			ARSnova.app.mainTabPanel.tabPanel.userTabPanel.inClassPanel.countFeedbackQuestions();
		},
		interval: 15000
	},

	initialize: function () {
		var me = this;
		this.callParent(arguments);

		var comingSoon = function (component) {
			var comingSoonPanel = Ext.create('Ext.Panel', {
				html: "<div style='padding: 0.5em'>" + Messages.FEATURE_COMING_SOON + "</div>"
			});
			comingSoonPanel.showBy(component, 'tc-bc');
			Ext.defer(function () {
				comingSoonPanel.destroy();
			}, 2000);
		};

		var loggedInCls = '';
		if (ARSnova.app.loginMode === ARSnova.app.LOGIN_THM) {
			loggedInCls = 'thm';
		}

		// Reload learning progress, but do it using a random delay.
		// We do not want to initiate a DDoS if every user is trying to reload at the same time.
		// http://stackoverflow.com/a/1527820
		var min = 250;
		var max = 1750;
		this.learningProgressChange = Ext.Function.createBuffered(function () {
			// Reset run-time to enforce reload of learning progress
			this.checkLearningProgressTask.taskRunTime = 0;
		}, Math.random() * (max - min) + min, this);

		this.sessionLogoutButton = Ext.create('Ext.Button', {
			text: Messages.SESSIONS,
			ui: 'back',
			cls: loggedInCls,
			handler: function () {
				ARSnova.app.getController('Sessions').logout();
			}
		});

		this.toolbar = Ext.create('Ext.Toolbar', {
			title: Ext.util.Format.htmlEncode(localStorage.getItem("shortName")),
			docked: 'top',
			ui: 'light',
			items: [
				this.sessionLogoutButton
			]
		});

		this.voteButton = Ext.create('ARSnova.view.MatrixButton', {
			text: Messages.GIVE_FEEDBACK,
			cls: ARSnova.app.isSessionOwner ? 'smallerActionButton' : 'actionButton',
			buttonConfig: 'icon',
			imageCls: 'icon-bullhorn',
			controller: 'Feedback',
			action: 'showVotePanel',
			handler: this.buttonClicked
		});

		this.feedbackButton = Ext.create('ARSnova.view.MatrixButton', {
			text: Messages.QUESTION_REQUEST_ADHOC,
			cls: ARSnova.app.isSessionOwner ? 'smallerActionButton' : 'actionButton',
			buttonConfig: 'icon',
			scope: this,
			imageCls: 'icon-question',
			controller: 'Feedback',
			action: 'showAskPanel',
			handler: this.buttonClicked
		});

		this.roleIconButton = Ext.create('ARSnova.view.MatrixButton', {
			text: Messages.CHANGE_ROLE_BUTTONTEXT,
			buttonConfig: 'icon',
			imageCls: 'icon-users',
			hidden: !ARSnova.app.isSessionOwner,
			controller: 'Sessions',
			action: 'changeRole',
			handler: this.buttonClicked
		});

		this.actionButtonPanel = Ext.create('Ext.Panel', {
			layout: {
				type: 'hbox',
				pack: 'center'
			},

			items: [{
					xtype: 'spacer',
					width: true,
					flex: '3',
					hidden: !ARSnova.app.isSessionOwner
				}, this.feedbackButton, {
					xtype: 'spacer',
					hidden: !ARSnova.app.isSessionOwner
				}, this.voteButton, {
					xtype: 'spacer',
					hidden: !ARSnova.app.isSessionOwner
				}, this.roleIconButton, {
					xtype: 'spacer',
					width: true,
					flex: '3',
					hidden: !ARSnova.app.isSessionOwner
				}
			]
		});

		this.lectureQuestionButton = Ext.create('ARSnova.view.MultiBadgeButton', {
			ui: 'normal',
			text: Messages.LECTURE_QUESTIONS_LONG,
			cls: 'forwardListButton',
			badgeCls: 'badgeicon',
			controller: 'Questions',
			action: 'lectureIndex',
			handler: this.buttonClicked
		});

		this.preparationQuestionButton = Ext.create('ARSnova.view.MultiBadgeButton', {
			ui: 'normal',
			text: Messages.PREPARATION_QUESTIONS_LONG,
			cls: 'forwardListButton',
			badgeCls: 'badgeicon',
			controller: 'Questions',
			action: 'preparationIndex',
			handler: this.buttonClicked
		});

		this.myQuestionsButton = Ext.create('ARSnova.view.MultiBadgeButton', {
			ui: 'normal',
			text: Messages.MY_QUESTIONS_AND_COMMENTS,
			cls: 'forwardListButton',
			badgeCls: 'badgeicon',
			controller: 'Questions',
			action: 'listFeedbackQuestions',
			handler: this.buttonClicked
		});

		this.myLearningProgressButton = Ext.create('ARSnova.view.MultiBadgeButton', {
			id: 'myLearningProgress',
			ui: 'normal',
			text: Messages.MY_LEARNING_PROGRESS,
			cls: 'forwardListButton',
			badgeCls: 'badgeicon',
			disabledCls: '',
			controller: 'Questions',
			action: 'showLearningProgress',
			handler: this.buttonClicked
		});

		var buttons = [];
		buttons.push(
			this.lectureQuestionButton,
			this.preparationQuestionButton,
			this.myQuestionsButton
		);

		this.inClassButtons = Ext.create('Ext.form.FormPanel', {
			cls: 'standardForm topPadding',
			scrollable: null,
			items: buttons
		});

		this.caption = Ext.create('ARSnova.view.Caption', {
			style: "border-radius: 15px",
			minScreenWidth: 440,
			hidden: true
		});

		this.inClass = Ext.create('Ext.form.FormPanel', {
			scrollable: null,
			items: [
				{
					xtype: 'panel',
					margin: '10 0 0 0',
					layout: {
						type: 'hbox',
						pack: 'center'
					},
					items: [
						{
							cls: 'gravure selectable',
							html: Messages.SESSION_ID + ": " + ARSnova.app.formatSessionID(sessionStorage.getItem("keyword"))
						},
						{
							xtype: 'button',
							cls: 'sessionInfoButton',
							iconCls: 'info',
							handler: function () {
								ARSnova.app.sessionModel.checkSessionLogin(sessionStorage.getItem("keyword"), {
									success: function (session) {
										var uTP = ARSnova.app.mainTabPanel.tabPanel.userTabPanel;
										var sessionForm = Ext.create('ARSnova.view.home.SessionInfoPanel', {
											sessionInfo: session,
											backReference: me,
											referencePanel: uTP
										});
										uTP.animateActiveItem(sessionForm, 'slide');
									}
								});
							}
						}
					]
				},
				this.actionButtonPanel, this.inClassButtons,
				{
					xtype: 'formpanel',
					style: 'margin-bottom: 10px;',
					cls: 'standardForm topPadding',
					scrollable: null,
					items: this.caption
				}
			]
		});

		this.swotBadge = Ext.create('Ext.Panel', {
			cls: 'swotBadgeIcon',
			hidden: true,
			width: '100%',
			height: '100px'
		});

		this.userBadges = Ext.create('Ext.Panel', {
			style: {
				marginTop: '20px'
			},
			layout: {
				type: 'hbox',
				pack: 'center'
			},

			items: [
				this.swotBadge
			]
		});

		this.badgeOptions = {
			numAnswers: 0,
			numQuestions: 0,
			numInterposed: 0,
			numUnredInterposed: 0
		};

		this.add([this.toolbar, this.inClass, this.userBadges]);
		this.on('painted', this.onPainted);
		this.on('hide', this.onDeactivate);

		// hide or show listeners won't work, so check if the tabpanel activates this panel
		ARSnova.app.mainTabPanel.tabPanel.on('activeitemchange', function (tabpanel, newPanel, oldPanel) {
			if (newPanel.down('#' + this.getId())) {
				var tP = ARSnova.app.mainTabPanel.tabPanel;
				if (oldPanel !== tP.rolePanel && oldPanel !== tP.homeTabPanel) {
					this.refreshListeners();
				}
			}
		}, this);
	},

	onPainted: function () {
		this.startTasks();

		ARSnova.app.restProxy.getMotdsForSession(sessionStorage.getItem("keyword"), {
			success: function (response) {
				var motds = Ext.decode(response.responseText);
				ARSnova.app.getController('Motds').showMotds(motds, 1);
			}
		});
	},

	/* will be called on session login */
	registerListeners: function () {
		var panel = ARSnova.app.mainTabPanel.tabPanel.userTabPanel.inClassPanel;
		ARSnova.app.questionModel.on(ARSnova.app.questionModel.events.unlockVote, panel.unlockQuestionVote, panel);
		ARSnova.app.questionModel.on(ARSnova.app.questionModel.events.unlockVotes, panel.questionAvailable, panel);
		ARSnova.app.questionModel.on(ARSnova.app.questionModel.events.startDelayedPiRound, panel.delayedPiRound, panel);
		ARSnova.app.questionModel.on(ARSnova.app.questionModel.events.lecturerQuestionAvailable, panel.questionAvailable, panel);
		ARSnova.app.questionModel.on(ARSnova.app.questionModel.events.lecturerQuestionLocked, panel.questionLocked, panel);
		ARSnova.app.questionModel.on(ARSnova.app.questionModel.events.unansweredLecturerQuestions, panel.checkLecturerQuestions, panel);
		ARSnova.app.questionModel.on(ARSnova.app.questionModel.events.unansweredPreparationQuestions, panel.checkPreparationQuestions, panel);
		ARSnova.app.questionModel.on(ARSnova.app.questionModel.events.countQuestionsAndAnswers, panel.countQuestionsAndAnswers, panel);
		ARSnova.app.sessionModel.on(ARSnova.app.sessionModel.events.sessionActive, panel.checkSessionStatus, panel);
		ARSnova.app.feedbackModel.on(ARSnova.app.feedbackModel.events.feedbackReset, panel.checkFeedbackRemoved, panel);
		ARSnova.app.sessionModel.on(ARSnova.app.sessionModel.events.learningProgressChange, panel.learningProgressChange, panel);
	},

	/* will be called whenever panel is shown */
	refreshListeners: function () {
		var features = ARSnova.app.getController('Feature').getActiveFeatures();

		// tasks should get run immediately
		if (features.interposed) {
			this.countFeedbackQuestionsTask.taskRunTime = 0;
		}
		if (features.learningProgress) {
			this.checkLearningProgressTask.taskRunTime = 0;
		}

		ARSnova.app.socket.setSession(null);
		ARSnova.app.socket.setSession(sessionStorage.getItem('keyword'));
	},

	startTasks: function () {
		var panel = ARSnova.app.mainTabPanel.tabPanel.userTabPanel.inClassPanel;
		var features = ARSnova.app.getController('Feature').getActiveFeatures();

		if (features.interposed) {
			ARSnova.app.taskManager.start(panel.countFeedbackQuestionsTask);
		}
		if (features.learningProgress) {
			ARSnova.app.taskManager.start(panel.checkLearningProgressTask);
		}
	},

	stopTasks: function () {
		var panel = ARSnova.app.mainTabPanel.tabPanel.userTabPanel.inClassPanel;
		ARSnova.app.taskManager.stop(panel.countFeedbackQuestionsTask);
		ARSnova.app.taskManager.stop(panel.checkLearningProgressTask);
	},

	/* will be called on session logout */
	destroyListeners: function () {
		var panel = ARSnova.app.mainTabPanel.tabPanel.userTabPanel.inClassPanel;
		ARSnova.app.questionModel.un(ARSnova.app.questionModel.events.unlockVote, panel.unlockQuestionVote, panel);
		ARSnova.app.questionModel.un(ARSnova.app.questionModel.events.unlockVotes, panel.questionAvailable, panel);
		ARSnova.app.questionModel.un(ARSnova.app.questionModel.events.startDelayedPiRound, panel.delayedPiRound, panel);
		ARSnova.app.questionModel.un(ARSnova.app.questionModel.events.lecturerQuestionAvailable, panel.questionAvailable, panel);
		ARSnova.app.questionModel.un(ARSnova.app.questionModel.events.lecturerQuestionLocked, panel.questionLocked, panel);
		ARSnova.app.questionModel.un(ARSnova.app.questionModel.events.unansweredLecturerQuestions, panel.checkLecturerQuestions, panel);
		ARSnova.app.questionModel.un(ARSnova.app.questionModel.events.unansweredPreparationQuestions, panel.checkPreparationQuestions, panel);
		ARSnova.app.questionModel.un(ARSnova.app.questionModel.events.countQuestionsAndAnswers, panel.countQuestionsAndAnswers, panel);
		ARSnova.app.sessionModel.un(ARSnova.app.sessionModel.events.sessionActive, panel.checkSessionStatus, panel);
		ARSnova.app.feedbackModel.un(ARSnova.app.feedbackModel.events.feedbackReset, panel.checkFeedbackRemoved, panel);
		ARSnova.app.sessionModel.un(ARSnova.app.sessionModel.events.learningProgressChange, panel.learningProgressChange, panel);
		panel.stopTasks();
	},

	updateCaption: function () {
		var hasOptions = false;
		var features = ARSnova.app.getController('Feature').getActiveFeatures();

		if (!features.lecture && !features.jitt) {
			this.badgeOptions.numQuestions = 0;
			this.badgeOptions.numAnswers = 0;
		} else if (!features.lecture && features.jitt) {
			this.badgeOptions.numQuestions = this.badgeOptions.numPrepQuestions;
			this.badgeOptions.numAnswers = this.badgeOptions.numPrepAnswers;
		}

		if (!features.interposed) {
			this.badgeOptions.numInterposed = 0;
			this.badgeOptions.numUnredInterposed = 0;
		}

		hasOptions = this.badgeOptions.numAnswers ||
			this.badgeOptions.numQuestions ||
			this.badgeOptions.numInterposed ||
			this.badgeOptions.numUnredInterposed;

		if (hasOptions) {
			this.caption.explainBadges([this.badgeOptions]);
			this.caption.listButton.setText(' ');
			this.caption.show();
		} else {
			this.caption.hide();
		}
	},

	unlockQuestionVote: function (object) {
		var question = {
			"_id": object._id,
			"variant": object.variant
		};

		this.questionAvailable([question]);
	},

	questionAvailable: function (questions) {
		var lectureQuestions = questions.filter(function (q) {
			return q.variant === "lecture";
		});
		var prepQuestions = questions.filter(function (q) {
			return q.variant === "preparation";
		});
		if (lectureQuestions.length > 0) {
			this.showNotification(lectureQuestions, lectureQuestions[0].variant);
		}
		if (prepQuestions.length > 0) {
			this.showNotification(prepQuestions, prepQuestions[0].variant);
		}
	},

	questionLocked: function (questions) {
		var tabPanel = ARSnova.app.mainTabPanel.tabPanel;

		var lectureQuestions = questions.filter(function (q) {
			return q.variant === "lecture";
		});
		var prepQuestions = questions.filter(function (q) {
			return q.variant === "preparation";
		});
		if (lectureQuestions.length > 0) {
			tabPanel.userQuestionsPanel.removeQuestions(lectureQuestions);
		}
		if (prepQuestions.length > 0) {
			tabPanel.userQuestionsPanel.removeQuestions(prepQuestions);
		}
	},

	delayedPiRound: function (roundObject) {
		var object = [{
			'_id': roundObject._id,
			variant: roundObject.variant
		}];

		this.showNotification(object, roundObject.variant, true, roundObject.round);
	},

	checkLecturerQuestions: function (questionIds) {
		this.unansweredLectureQuestions = questionIds.length;
		this.updateQuestionsPanelBadge();

		if (questionIds.length > 0) {
			var hasUnreadQuestions = this.markQuestionsAsRead(questionIds, "lecture");
			if (!hasUnreadQuestions) {
				return;
			}

			this.showNotification(questionIds, "lecture");
		}
	},

	checkPreparationQuestions: function (questionIds) {
		this.unansweredPreparationQuestions = questionIds.length;
		this.updateQuestionsPanelBadge();

		if (questionIds.length > 0) {
			var hasUnreadQuestions = this.markQuestionsAsRead(questionIds, "preparation");
			if (!hasUnreadQuestions) {
				return;
			}

			this.showNotification(questionIds, "preparation");
		}
	},

	updateQuestionsPanelBadge: function () {
		var questionsPanel = ARSnova.app.mainTabPanel.tabPanel.userQuestionsPanel;

		if (questionsPanel.getMode() === 'lecture') {
			questionsPanel.tab.setBadgeText(this.unansweredLectureQuestions);
		} else if (questionsPanel.getMode() === 'preparation') {
			questionsPanel.tab.setBadgeText(this.unansweredPreparationQuestions);
		}
	},

	markQuestionsAsRead: function (questionIds, variant) {
		var showNotification = false;
		var questionsArr = Ext.decode(localStorage.getItem(variant + 'QuestionIds'));

		// check for each question if exists a "dont-remind-me"-flag
		for (var i = 0; i < questionIds.length; i++) {
			var question = questionIds[i];
			if (questionsArr.indexOf(question) === -1) {
				questionsArr.push(question);
				showNotification = true;
			}
		}
		localStorage.setItem(variant + 'QuestionIds', Ext.encode(questionsArr));
		return showNotification;
	},

	showNotification: function (questionIds, variant, newRound, round) {
		var features = ARSnova.app.getController('Feature').getActiveFeatures();

		if (features.lecture && variant === 'lecture' && !features.total ||
			features.jitt && variant === 'preparation') {
			this.showNotificationMessage(questionIds, variant, newRound, round);
		}
	},

	showNotificationMessage: function (questionIds, variant, newRound, round) {
		var titleLabel, messageLabel;
		var unansweredQuestionIds = variant === 'lecture' ?
			JSON.parse(sessionStorage.getItem('unansweredLectureQuestions')) :
			JSON.parse(sessionStorage.getItem('unansweredPreparationQuestions'));

		var callback = Ext.bind(function (answer) {
			if (answer === 'yes') {
				if (variant === 'lecture') {
					ARSnova.app.getController('Questions').lectureIndex({renew: true, ids: questionIds});
				} else {
					ARSnova.app.getController('Questions').preparationIndex({renew: true, ids: questionIds});
				}
			}
		}, this);

		if (questionIds.length === 1) {
			if (newRound) {
				if (Ext.Array.contains(unansweredQuestionIds, questionIds[0]._id)) {
					titleLabel = Messages.ONE_NEW_DELAYED_QUESTION;
					messageLabel = round === 2 ?
						Messages.ONE_NEW_DELAYED_QUESTION_ROUND2 :
						Messages.ONE_NEW_DELAYED_QUESTION_ROUND1;

					messageLabel = messageLabel + "<br>" + Messages.WANNA_ANSWER;
					Ext.Msg.confirm(titleLabel, messageLabel, callback);
				}
			} else {
				titleLabel = variant === 'lecture' ?
					Messages.ONE_NEW_LECTURE_QUESTION :
					Messages.ONE_NEW_PREPARATION_QUESTION;

				messageLabel = Messages.WANNA_ANSWER;
				Ext.Msg.confirm(titleLabel, messageLabel, callback);
			}
		} else {
			titleLabel = variant === 'lecture' ?
				Messages.SEVERAL_NEW_LECTURE_QUESTIONS :
				Messages.SEVERAL_NEW_PREPARATION_QUESTIONS;

			Ext.Msg.confirm(titleLabel.replace('###', questionIds.length), Messages.WANNA_ANSWER, callback);
		}
	},

	countQuestionsAndAnswers: function (data) {
		var features = ARSnova.app.getController('Feature').getActiveFeatures();
		var hasData = data.unansweredLectureQuestions
			|| data.lectureQuestionAnswers
			|| data.unansweredPreparationQuestions
			|| data.preparationQuestionAnswers;
		if (hasData && features.learningProgress) {
			this.inClassButtons.add(this.myLearningProgressButton);
		} else {
			this.inClassButtons.remove(this.myLearningProgressButton, false);
		}

		this.badgeOptions.numAnswers = data.lectureQuestionAnswers;
		this.badgeOptions.numQuestions = data.unansweredLectureQuestions;
		this.badgeOptions.numPrepAnswers = data.preparationQuestionAnswers;
		this.badgeOptions.numPrepQuestions = data.unansweredPreparationQuestions;
		this.updateCaption();

		this.lectureQuestionButton.setBadge([
			{badgeText: data.unansweredLectureQuestions, badgeCls: "questionsBadgeIcon"},
			{badgeText: data.lectureQuestionAnswers, badgeCls: "answersBadgeIcon"}
		]);
		this.preparationQuestionButton.setBadge([
			{badgeText: data.unansweredPreparationQuestions, badgeCls: "questionsBadgeIcon"},
			{badgeText: data.preparationQuestionAnswers, badgeCls: "answersBadgeIcon"}
		]);
	},

	buttonClicked: function (button) {
		ARSnova.app.mainTabPanel.tabPanel.userTabPanel.inClassPanel.stopTasks();
		ARSnova.app.getController(button.config.controller)[button.config.action]();
	},

	checkFeedbackRemoved: function (sessions) {
		if (Ext.Array.contains(sessions, sessionStorage.getItem("keyword"))) {
			Ext.Msg.alert(Messages.NOTICE, Messages.FEEDBACK_RESET);
		}
	},

	countFeedbackQuestions: function () {
		var me = ARSnova.app.mainTabPanel.tabPanel.userTabPanel.inClassPanel;
		var username = localStorage.getItem("login");
		ARSnova.app.questionModel.countFeedbackQuestions(sessionStorage.getItem("keyword"), username, {
			success: function (response) {
				var questionCount = Ext.decode(response.responseText);
				var myQuestionsButton = ARSnova.app.mainTabPanel.tabPanel.userTabPanel.inClassPanel.myQuestionsButton;
				myQuestionsButton.setBadge([{
					badgeText: questionCount.total
				}, {
					badgeText: questionCount.unread,
					badgeCls: "redbadgeicon"
				}]);

				me.badgeOptions.numQuestions = questionCount.total || me.badgeOptions.numQuestions;
				me.badgeOptions.numUnredInterposed = questionCount.unread;
				me.updateCaption();

				if (questionCount.total === 0) {
					myQuestionsButton.setHandler(Ext.bind(function () {
						me.stopTasks();
						ARSnova.app.getController('Feedback').showAskPanel({
							type: 'slide'
						});
					}, me));
				} else {
					myQuestionsButton.setHandler(me.buttonClicked);
				}
			},
			failure: function () {
				console.log('server-side error');
			}
		});
	},

	/* if the session was closed, show a notification window */
	checkSessionStatus: function (isActive) {
		if (!isActive) {
			Ext.Msg.show({
				title: 'Hinweis:',
				message: Messages.SESSION_CLOSE_NOTICE,
				buttons: [{
					text: Messages.NOTICE_READ,
					ui: 'action'
				}]
			});
		}
	},

	checkLearningProgress: function () {
		var me = ARSnova.app.mainTabPanel.tabPanel.userTabPanel.inClassPanel;
		ARSnova.app.sessionModel.getMyLearningProgress(sessionStorage.getItem("keyword"), {
			success: function (myprogressDescription, courseprogressDescription, p, progressType) {
				var goodProgressThreshold = 95;
				var vsBadge = {badgeText: Messages.VERSUS, badgeCls: "textbadgeicon"};

				var getBadge = function (progress) {
					return {badgeText: progress.text, badgeCls: progress.color + "badgeicon"};
				};
				me.myLearningProgressButton.setBadge([getBadge(myprogressDescription), vsBadge, getBadge(courseprogressDescription)]);

				me.swotBadge.setCls('swotBadgeIcon greenbadgecolor');
				me.swotBadge.setHidden(p.myProgress < goodProgressThreshold);
			},
			failure: function () {
				me.myLearningProgressButton.setBadge([{badgeText: ""}]);
				me.inClassButtons.remove(me.myLearningProgressButton, false);
			}
		});
	},

	applyUIChanges: function (features) {
		if (features.total) {
			this.caption.setBadgeTranslation({
				feedback: Messages.QUESTIONS_FROM_STUDENTS,
				unredFeedback: Messages.UNREAD_QUESTIONS_FROM_STUDENTS,
				questions: Messages.QUESTIONS,
				answers: Messages.COMMENTS
			});
		}
	}
});
