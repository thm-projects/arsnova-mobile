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
Ext.define('ARSnova.view.user.InClass', {
	extend: 'Ext.Panel',

	requires: ['ARSnova.view.MultiBadgeButton'],

	config: {
		title: 'InClass',
		fullscreen: true,
		scrollable: true
	},

	inClass: null,
	feedbackButton: null,
	questionsButton: null,
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
		this.callParent(arguments);

		var comingSoon = function (component) {
			var comingSoonPanel = Ext.create('Ext.Panel', {
				html: "<div style='padding: 0.5em'>" + Messages.FEATURE_COMING_SOON+"</div>"
			});
			comingSoonPanel.showBy(component, 'tc-bc');
			Ext.defer(function () {
				comingSoonPanel.destroy();
			}, 2000);
		};

		var loggedInCls = '';
		if (ARSnova.app.loginMode == ARSnova.app.LOGIN_THM) {
			loggedInCls = 'thm';
		}

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

		this.feedbackButton = Ext.create('ARSnova.view.MultiBadgeButton', {
			ui: 'normal',
			text: Messages.GIVE_FEEDBACK,
			cls: 'forwardListButton',
			badgeCls: 'x-button-icon x-shown icon-radar',
			controller: 'Feedback',
			action: 'showVotePanel',
			handler: this.buttonClicked
		});

		this.lectureQuestionButton = Ext.create('ARSnova.view.MultiBadgeButton', {
			ui: 'normal',
			text: Messages.LECTURE_QUESTIONS,
			cls: 'forwardListButton',
			badgeCls: 'badgeicon',
			controller: 'Questions',
			action: 'lectureIndex',
			handler: this.buttonClicked
		});

		this.preparationQuestionButton = Ext.create('ARSnova.view.MultiBadgeButton', {
			ui: 'normal',
			text: Messages.PREPARATION_QUESTIONS,
			cls: 'forwardListButton',
			badgeCls: 'badgeicon',
			controller: 'Questions',
			action: 'preparationIndex',
			handler: this.buttonClicked
		});

		if (ARSnova.app.globalConfig.features.studentsOwnQuestions) {
			this.myQuestionsButton = Ext.create('ARSnova.view.MultiBadgeButton', {
				ui: 'normal',
				text: Messages.MY_QUESTIONS,
				cls: 'forwardListButton',
				badgeCls: 'badgeicon',
				controller: 'Questions',
				action: 'listFeedbackQuestions',
				handler: this.buttonClicked
			});
		}

		if (ARSnova.app.globalConfig.features.learningProgress) {
			this.myLearningProgressButton = Ext.create('ARSnova.view.MultiBadgeButton', {
				ui: 'normal',
				text: Messages.MY_LEARNING_PROGRESS,
				cls: 'answerListButton',
				badgeCls: 'badgeicon'
			});
		}

		var buttons = [];
		buttons.push(this.feedbackButton);
		if (ARSnova.app.globalConfig.features.studentsOwnQuestions) {
			buttons.push(this.myQuestionsButton);
		}
		buttons.push(
			this.lectureQuestionButton,
			this.preparationQuestionButton
		);
		if (ARSnova.app.globalConfig.features.learningProgress) {
			buttons.push(this.myLearningProgressButton);
		}

		this.inClass = Ext.create('Ext.form.FormPanel', {
			scrollable: null,
			items: [{
				cls: 'gravure',
				html: Messages.SESSION_ID + ": " + ARSnova.app.formatSessionID(localStorage.getItem("keyword"))
			}, {
				xtype: 'formpanel',
				cls: 'standardForm topPadding',
				scrollable: null,
				items: buttons
			}]
		});

		this.swotBadge = Ext.create('Ext.Img', {
			src: 'resources/images/badge_streber_1.png',
			width: 100,
			height: 100,
			hidden: true
		});

		this.userBadges = Ext.create('Ext.Panel', {
			style: {marginTop: '20px'},
			layout: {
				type: 'hbox',
				pack: 'center'
			},
			hidden: !ARSnova.app.globalConfig.features.learningProgress,

			items: [
				this.swotBadge
			]

		});

		this.add([this.toolbar, this.inClass, this.userBadges]);

		this.on('initialize', function () {
			this.feedbackButton.setBadge([{badgeText: ' '}]);
		});

		// hide or show listeners won't work, so check if the tabpanel activates this panel
		ARSnova.app.mainTabPanel.tabPanel.on('activeitemchange', function (tabpanel, newPanel, oldPanel) {
			if (newPanel.down('#' + this.getId()) !== null) {
				this.refreshListeners();
			}
		}, this);
	},

	/* will be called on session login */
	registerListeners: function () {
		var panel = ARSnova.app.mainTabPanel.tabPanel.userTabPanel.inClassPanel;
		ARSnova.app.questionModel.on(ARSnova.app.questionModel.events.lecturerQuestionAvailable, panel.questionAvailable, panel);
		ARSnova.app.questionModel.on(ARSnova.app.questionModel.events.unansweredLecturerQuestions, panel.checkLecturerQuestions, panel);
		ARSnova.app.questionModel.on(ARSnova.app.questionModel.events.unansweredPreparationQuestions, panel.checkPreparationQuestions, panel);
		ARSnova.app.sessionModel.on(ARSnova.app.sessionModel.events.sessionActive, panel.checkSessionStatus, panel);
		ARSnova.app.feedbackModel.on(ARSnova.app.feedbackModel.events.feedbackReset, panel.checkFeedbackRemoved, panel);
		if (ARSnova.app.globalConfig.features.studentsOwnQuestions) {
			ARSnova.app.taskManager.start(panel.countFeedbackQuestionsTask);
		}
		if (ARSnova.app.globalConfig.features.learningProgress) {
			ARSnova.app.taskManager.start(panel.checkLearningProgressTask);
		}
	},

	/* will be called whenever panel is shown */
	refreshListeners: function () {
		// tasks should get run immediately
		if (ARSnova.app.globalConfig.features.studentsOwnQuestions) {
			this.countFeedbackQuestionsTask.taskRunTime = 0;
		}
		if (ARSnova.app.globalConfig.features.learningProgress) {
			this.checkLearningProgressTask.taskRunTime = 0;
		}
	},

	/* will be called on session logout */
	destroyListeners: function () {
		var panel = ARSnova.app.mainTabPanel.tabPanel.userTabPanel.inClassPanel;
		ARSnova.app.questionModel.un(ARSnova.app.questionModel.events.lecturerQuestionAvailable, panel.questionAvailable, panel);
		ARSnova.app.questionModel.un(ARSnova.app.questionModel.events.unansweredLecturerQuestions, panel.checkLecturerQuestions, panel);
		ARSnova.app.questionModel.un(ARSnova.app.questionModel.events.unansweredPreparationQuestions, panel.checkPreparationQuestions, panel);
		ARSnova.app.sessionModel.un(ARSnova.app.sessionModel.events.sessionActive, panel.checkSessionStatus, panel);
		ARSnova.app.feedbackModel.un(ARSnova.app.feedbackModel.events.feedbackReset, panel.checkFeedbackRemoved, panel);
		if (ARSnova.app.globalConfig.features.studentsOwnQuestions) {
			ARSnova.app.taskManager.stop(panel.countFeedbackQuestionsTask);
		}
		if (ARSnova.app.globalConfig.features.learningProgress) {
			ARSnova.app.taskManager.stop(panel.checkLearningProgressTask);
		}
	},

	questionAvailable: function (question) {
		this.showNotification([question._id], question.variant);
	},

	checkLecturerQuestions: function (questionIds) {
		ARSnova.app.mainTabPanel.tabPanel.userQuestionsPanel.tab.setBadgeText(questionIds.length);
		if (questionIds.length > 0) {
			var hasUnreadQuestions = this.markQuestionsAsRead(questionIds, "lecture");
			if (!hasUnreadQuestions) return;

			this.showNotification(questionIds, "lecture");
		}
	},

	checkPreparationQuestions: function (questionIds) {
		if (questionIds.length > 0) {
			var hasUnreadQuestions = this.markQuestionsAsRead(questionIds, "preparation");
			if (!hasUnreadQuestions) return;

			this.showNotification(questionIds, "preparation");
		}
	},

	markQuestionsAsRead: function (questionIds, variant) {
		var showNotification = false;
		var questionsArr = Ext.decode(localStorage.getItem(variant + 'QuestionIds'));

		// check for each question if exists a "dont-remind-me"-flag
		for (var i = 0; i < questionIds.length; i++) {
			var question = questionIds[i];
			if (questionsArr.indexOf(question) == -1) {
				questionsArr.push(question);
				showNotification = true;
			}
		}
		localStorage.setItem(variant + 'QuestionIds', Ext.encode(questionsArr));
		return showNotification;
	},

	showNotification: function (questionIds, variant) {
		var callback = Ext.bind(function (answer) {
			if (answer == 'yes') {
				if (variant === 'lecture') {
					ARSnova.app.getController('Questions').lectureIndex({ renew: true });
				} else {
					ARSnova.app.getController('Questions').preparationIndex({ renew: true });
				}
			}
		}, this);
		if (questionIds.length == 1) {
			Ext.Msg.confirm(Messages.ONE_NEW_QUESTION, Messages.WANNA_ANSWER, callback);
		} else {
			Ext.Msg.confirm(
				Messages.THERE_ARE + ' ' + questionIds.length + ' ' + Messages.NEW_QUESTIONS, Messages.WANNA_ANSWER,
				callback
			);
		}
	},

	/**
	 * fetch all new unanswered skill questions for this session and show a notification
	 * if user don't want to answer this questions now, save this opinion in localStorage
	 */
	checkNewSkillQuestions: function () {
		ARSnova.app.questionModel.getUnansweredPreparationQuestions(localStorage.getItem("keyword"), {
			success: function (newQuestions) {
				ARSnova.app.questionModel.countPreparationQuestionAnswers(localStorage.getItem("keyword"), {
					success: function (response) {
						var numAnswers = parseInt(response.responseText);

						var panel = ARSnova.app.mainTabPanel.tabPanel.userTabPanel.inClassPanel;

						panel.preparationQuestionButton.setBadge([
											{badgeText: newQuestions.length, badgeCls: "greybadgeicon"},
											{badgeText: numAnswers, badgeCls: "redbadgeicon"}
										]);
					},
					failure: Ext.emptyFn
				});
			},
			failure: Ext.emptyFn
		});
		ARSnova.app.questionModel.getUnansweredLectureQuestions(localStorage.getItem("keyword"), {
			success: function (newQuestions) {
				ARSnova.app.questionModel.countLectureQuestionAnswers(localStorage.getItem("keyword"), {
					success: function (response) {
						var numAnswers = parseInt(response.responseText);

						var panel = ARSnova.app.mainTabPanel.tabPanel.userTabPanel.inClassPanel;

						panel.lectureQuestionButton.setBadge([
											{badgeText: newQuestions.length, badgeCls: "greybadgeicon"},
											{badgeText: numAnswers, badgeCls: "redbadgeicon"}
										]);
					},
					failure: Ext.emptyFn
				});
			},
			failure: function (response) {
				console.log('error');
			}
		});
	},

	buttonClicked: function (button) {
		ARSnova.app.getController(button.config.controller)[button.config.action]();
	},

	checkFeedbackRemoved: function (sessions) {
		if (Ext.Array.contains(sessions, localStorage.getItem("keyword"))) {
			Ext.Msg.alert(Messages.NOTICE, Messages.FEEDBACK_RESET);

			var feedbackButton = ARSnova.app.mainTabPanel.tabPanel.userTabPanel.inClassPanel.feedbackButton;
			feedbackButton.badgeEl ? feedbackButton.badgeEl.destroy() : '';
			feedbackButton.badgeEl = null;
			feedbackButton.badgeCls = "x-button-icon x-shown icon-radar";
			feedbackButton.setBadge([{badgeText: " "}]);
		}
	},

	countFeedbackQuestions: function () {
		ARSnova.app.questionModel.countFeedbackQuestions(localStorage.getItem("keyword"), {
			success: function (response) {
				var questionCount = Ext.decode(response.responseText);

				var myQuestionsButton = ARSnova.app.mainTabPanel.tabPanel.userTabPanel.inClassPanel.myQuestionsButton;
				myQuestionsButton.setBadge([{
					badgeText: questionCount.total
				}, {
					badgeText: questionCount.unread,
					badgeCls: "redbadgeicon"
				}]);
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
		var me = this;
		ARSnova.app.sessionModel.getMyLearningProgress(localStorage.getItem("keyword"), {
			success: function (response) {
				var goodProgressThreshold = 75;
				var avgProgressThreshold = 25;
				var p = Ext.apply({myprogress: 0, courseprogress: 0}, Ext.decode(response.responseText));
				var vsBadge = {badgeText: Messages.VERSUS, badgeCls: "textbadgeicon"};
				var getBadge = function (percentage) {
					if (percentage >= goodProgressThreshold) {
						return {badgeText: percentage+"%", badgeCls: "greenbadgeicon"};
					} else if (percentage >= avgProgressThreshold) {
						return {badgeText: percentage+"%", badgeCls: "yellowbadgeicon"};
					} else {
						return {badgeText: percentage+"%", badgeCls: "redbadgeicon"};
					}
				};
				if (p.myprogress === 0 && p.courseprogress === 0) {
					me.myLearningProgressButton.setBadge([{badgeText: "…"}, vsBadge, {badgeText: "…"}]);
				} else {
					me.myLearningProgressButton.setBadge([getBadge(p.myprogress), vsBadge, getBadge(p.courseprogress)]);
				}
				me.swotBadge.setHidden(p.myprogress < goodProgressThreshold);
			},
			failure: function () {
				me.myLearningProgressButton.setBadge([{badgeText: ""}]);
			}
		});
	}
});
