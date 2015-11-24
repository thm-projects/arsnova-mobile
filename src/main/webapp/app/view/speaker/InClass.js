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
Ext.define('ARSnova.view.speaker.InClass', {
	extend: 'Ext.Panel',

	requires: [
		'ARSnova.view.MultiBadgeButton',
		'ARSnova.view.SessionStatusButton'
	],

	config: {
		fullscreen: true,
		title: Messages.FEEDBACK,
		scrollable: {
			direction: 'vertical',
			directionLock: true
		}
	},

	inClassItems: null,

	inClassActions: null,
	sessionStatusButton: null,
	createAdHocQuestionButton: null,

	/**
	 * task for speakers in a session
	 * count every x seconds the number of feedback questions
	 */
	countFeedbackQuestionsTask: {
		name: 'count feedback questions',
		run: function () {
			ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel.inClassPanel.countFeedbackQuestions();
		},
		interval: 15000
	},

	courseLearningProgressTask: {
		name: 'get the students learning progress',
		run: function () {
			ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel.inClassPanel.courseLearningProgress();
		},
		interval: 15000
	},

	initialize: function () {
		var me = this;
		this.callParent(arguments);

		var comingSoon = function (component) {
			var comingSoonPanel = Ext.create('Ext.Panel', {
				top: -1000,
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
		var min = 500;
		var max = 2500;
		this.learningProgressChange = Ext.Function.createBuffered(function () {
			// Reset run-time to enforce reload of learning progress
			this.courseLearningProgressTask.taskRunTime = 0;
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
			cls: 'speakerTitleText',
			ui: 'light',
			docked: 'top',
			items: [
				this.sessionLogoutButton,
				{xtype: 'spacer'},
				{
					xtype: 'button',
					iconCls: 'icon-qrcode',
					cls: 'toggleCorrectButton',
					handler: function (button) {
						ARSnova.app.getController('Application').showQRCode();
					}
				}
			]
		});

		this.createAdHocQuestionButton = Ext.create('ARSnova.view.MatrixButton', {
			text: Messages.NEW_QUESTION,
			altText: Messages.NEW_TASK,
			cls: 'smallerActionButton',
			buttonConfig: 'icon',
			imageCls: 'icon-question thm-green',
			mode: 'lecture',
			controller: 'Questions',
			action: 'adHoc',
			scope: this,
			handler: function () {
				var button = this.createAdHocQuestionButton;
				button.config.controller = button.config.mode === 'preparation' ?
					'PreparationQuestions' : 'Questions';

				this.buttonClicked(button);
			}
		});

		this.showcaseActionButton = Ext.create('ARSnova.view.MatrixButton', {
			text: Messages.SHOWCASE_MODE,
			altText: Messages.SHOWCASE_TASKS,
			cls: 'smallerActionButton',
			buttonConfig: 'icon',
			imageCls: 'icon-presenter thm-grey',
			handler: this.showcaseHandler,
			hidden: true
		});

		this.roleIconButton = Ext.create('ARSnova.view.MatrixButton', {
			cls: 'roleIconBtn',
			buttonConfig: 'icon',
			imageCls: 'icon-speaker',
			handler: function () {
				ARSnova.app.getController('Sessions').changeRole();
			}
		});

		this.actionButtonPanel = Ext.create('Ext.Panel', {
			layout: {
				type: 'hbox',
				pack: 'center'
			},

			style: 'margin: 15px',
			items: [{
				xtype: 'spacer',
				flex: '3',
				width: true
			}, this.showcaseActionButton, {
				xtype: 'spacer',
				itemId: 'innerLeftSpacer'
			}, this.roleIconButton, {
				xtype: 'spacer',
				itemId: 'innerRightSpacer'
			}, this.createAdHocQuestionButton, {
				xtype: 'spacer',
				flex: '3',
				width: true
			}]
		});

		this.preparationQuestionButton = Ext.create('ARSnova.view.MultiBadgeButton', {
			text: Messages.PREPARATION_QUESTIONS_LONG,
			cls: 'forwardListButton',
			controller: 'PreparationQuestions',
			action: 'listQuestions',
			handler: this.buttonClicked
		});

		this.lectureQuestionButton = Ext.create('ARSnova.view.MultiBadgeButton', {
			text: Messages.LECTURE_QUESTIONS_LONG,
			cls: 'forwardListButton',
			controller: 'Questions',
			action: 'listQuestions',
			handler: this.buttonClicked
		});

		this.feedbackQuestionButton = Ext.create('ARSnova.view.MultiBadgeButton', {
			ui: 'normal',
			text: Messages.QUESTIONS_FROM_STUDENTS,
			cls: 'forwardListButton',
			controller: 'Questions',
			action: 'listFeedbackQuestions',
			handler: this.buttonClicked
		});

		this.courseLearningProgressButton = Ext.create('ARSnova.view.MultiBadgeButton', {
			itemId: 'courseLearningProgress',
			text: Messages.COURSES_LEARNING_PROGRESS,
			cls: 'forwardListButton',
			controller: 'Questions',
			action: 'showLearningProgress',
			handler: this.buttonClicked
		});

		var buttons = [
			this.feedbackQuestionButton,
			this.lectureQuestionButton,
			this.preparationQuestionButton
		];

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

		this.sessionStatusButton = Ext.create('ARSnova.view.SessionStatusButton');

		this.deleteSessionButton = Ext.create('ARSnova.view.MatrixButton', {
			id: 'delete-session-button',
			text: Messages.DELETE_SESSION,
			buttonConfig: 'icon',
			cls: 'smallerActionButton',
			imageCls: 'icon-close thm-red',
			scope: this,
			handler: function () {
				var msg = Messages.ARE_YOU_SURE +
						"<br>" + Messages.DELETE_SESSION_NOTICE;
				Ext.Msg.confirm(Messages.DELETE_SESSION_TITLE, msg, function (answer) {
					if (answer === 'yes') {
						ARSnova.app.showLoadIndicator(Messages.LOAD_MASK_SESSION_DELETE);
						ARSnova.app.sessionModel.destroy(sessionStorage.getItem('keyword'), {
							success: function () {
								ARSnova.app.getController('Sessions').logout();
							},
							failure: function (response) {
								console.log('server-side error delete session');
							}
						});
					}
				});
			}
		});

		this.featureChangeEntryButton = Ext.create('ARSnova.view.MatrixButton', {
			text: Messages.CHANGE_FEATURES,
			buttonConfig: 'icon',
			cls: 'smallerActionButton',
			imageCls: 'icon-dashboard',
			scope: this,
			handler: function () {
				ARSnova.app.getController('Sessions').loadFeatureOptions({
					inClassPanelEntry: true,
					lastPanel: this
				});
			}
		});

		this.inClassActions = Ext.create('Ext.Panel', {
			style: {marginTop: '20px'},
			layout: {
				type: 'hbox',
				pack: 'center'
			},
			items: [{
				xtype: 'spacer',
				flex: '3',
				width: true
			}, this.featureChangeEntryButton, {
				xtype: 'spacer'
			}, this.sessionStatusButton, {
				xtype: 'spacer'
			}, this.deleteSessionButton, {
				xtype: 'spacer',
				flex: '3',
				width: true
			}]
		});

		this.inClassItems = Ext.create('Ext.form.FormPanel', {
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
										var sTP = ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel;
										var sessionForm = Ext.create('ARSnova.view.home.SessionInfoPanel', {
											sessionInfo: session,
											backReference: me,
											referencePanel: sTP
										});
										sTP.animateActiveItem(sessionForm, 'slide');
									}
								});
							}
						}
					]
				},
				{
					xtype: 'panel',
					margin: '10 0 0 0',
					layout: {
						type: 'hbox',
						pack: 'center'
					},
					items: [
						{
							cls: 'gravure selectable directlink-text',
							html: Messages.DIRECTLINK + ": " + window.location + 'id/' + sessionStorage.getItem('keyword')
						}
					]
				},
				this.actionButtonPanel,
				this.inClassButtons,
				{
					xtype: 'formpanel',
					cls: 'standardForm topPadding',
					scrollable: null,
					items: this.caption
				},
				this.inClassActions
			]
		});


		this.badgeOptions = {
			numAnswers: 0,
			numQuestions: 0,
			numInterposed: 0,
			numUnredInterposed: 0
		};

		this.add([this.toolbar, this.inClassItems]);
		this.on('destroy', this.destroyListeners);

		this.onBefore('painted', function () {
			this.onActivate();
		});

		this.on('show', this.refreshListeners);
	},

	buttonClicked: function (button) {
		ARSnova.app.getController(button.config.controller)[button.config.action]();
	},

	showcaseHandler: function () {
		var screenWidth = (window.innerWidth > 0) ? window.innerWidth : screen.width;
		var sTP = ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel;
		var activateProjectorMode = screenWidth >= 700;

		var showShowcasePanel = Ext.create('Ext.util.DelayedTask', function () {
			sTP.showcaseQuestionPanel.inclassBackButtonHandle = true;
			sTP.animateActiveItem(sTP.showcaseQuestionPanel, 'slide');
		});

		ARSnova.app.projectorModeActive = activateProjectorMode;
		ARSnova.app.getController('Application').storeGlobalZoomLevel();
		ARSnova.app.mainTabPanel.tabPanel.getTabBar().setHidden(activateProjectorMode);
		ARSnova.app.getController('Application').toggleFullScreen(activateProjectorMode);
		showShowcasePanel.delay(activateProjectorMode ? 1250 : 0);
	},

	changeActionButtonsMode: function (mode) {
		var features = Ext.decode(sessionStorage.getItem("features"));

		if (mode === 'preparation') {
			this.createAdHocQuestionButton.config.mode = 'preparation';
			this.showcaseActionButton.setButtonText(this.showcaseActionButton.config.altText);
			this.createAdHocQuestionButton.setButtonText(this.createAdHocQuestionButton.config.altText);
		} else {
			this.createAdHocQuestionButton.config.mode = 'lecture';
			this.showcaseActionButton.setButtonText(this.showcaseActionButton.config.text);
			this.createAdHocQuestionButton.setButtonText(
				features.flashcard ? Messages.NEW_FLASHCARD : this.createAdHocQuestionButton.config.text
			);
		}
	},

	updateActionButtonElements: function (showElements) {
		var me = this;
		var features = Ext.decode(sessionStorage.getItem("features"));
		var hasQuestionFeature = features.lecture || features.jitt;

		if (!showElements) {
			me.roleIconButton.setCls('');
			me.roleIconButton.setButtonText(Messages.CHANGE_ROLE_BUTTONTEXT);
		} else {
			me.roleIconButton.setCls('roleIconBtn');
			me.roleIconButton.setButtonText();
		}

		this.actionButtonPanel.getInnerItems().forEach(function (element) {
			if (element === me.showcaseActionButton ||
				element.getItemId() === 'innerLeftSpacer') {
				element.setHidden(!showElements);
			}
		});

		Ext.ComponentQuery.query('#innerRightSpacer')[0].setHidden(!hasQuestionFeature);
	},

	/* will be called on session login */
	registerListeners: function () {
		var inClassPanel = ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel.inClassPanel;
		ARSnova.app.taskManager.start(inClassPanel.countFeedbackQuestionsTask);
		if (ARSnova.app.globalConfig.features.learningProgress) {
			ARSnova.app.sessionModel.on(ARSnova.app.sessionModel.events.learningProgressChange, this.learningProgressChange, this);
			ARSnova.app.taskManager.start(inClassPanel.courseLearningProgressTask);
		}
	},

	/* will be called whenever panel is shown */
	refreshListeners: function () {
		// tasks should get run immediately
		this.countFeedbackQuestionsTask.taskRunTime = 0;
		if (ARSnova.app.globalConfig.features.learningProgress) {
			this.courseLearningProgressTask.taskRunTime = 0;
		}
	},

	/* will be called on session logout */
	destroyListeners: function () {
		var inClassPanel = ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel.inClassPanel;
		ARSnova.app.taskManager.stop(inClassPanel.countFeedbackQuestionsTask);
		if (ARSnova.app.globalConfig.features.learningProgress) {
			ARSnova.app.sessionModel.un(ARSnova.app.sessionModel.events.learningProgressChange, this.learningProgressChange, this);
			ARSnova.app.taskManager.stop(inClassPanel.courseLearningProgressTask);
		}
	},

	onActivate: function () {
		var features = Ext.decode(sessionStorage.getItem("features"));
		var sTP = ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel;
		sTP.inClassPanel.updateActionButtonElements(false);
		sTP.inClassPanel.updateAudienceQuestionBadge();
		this.applyUIChanges(features);
	},

	updateCaption: function () {
		var me = this, hasOptions = false;
		var features = Ext.decode(sessionStorage.getItem("features"));

		if (features) {
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
		}

		hasOptions = this.badgeOptions.numAnswers ||
			this.badgeOptions.numUnredInterposed ||
			this.badgeOptions.numInterposed ||
			this.badgeOptions.numQuestions;

		if (hasOptions) {
			me.caption.explainBadges([me.badgeOptions]);
			me.caption.listButton.setText(' ');
			me.caption.show();
		} else {
			me.caption.hide();
		}
	},

	updateAudienceQuestionBadge: function () {
		var me = this;
		var features = Ext.decode(sessionStorage.getItem("features")) || {
			jitt: true, lecture: true, learningProgress: true
		};

		var failureCallback = function () {
			console.log('server-side error');
		};

		var lecturePromise = new RSVP.Promise();
		var prepPromise = new RSVP.Promise();

		ARSnova.app.questionModel.countLectureQuestions(sessionStorage.getItem("keyword"), {
			success: function (response) {
				var numQuestions = parseInt(response.responseText);
				me.badgeOptions.numQuestions = numQuestions;

				if (numQuestions && features.lecture) {
					if (numQuestions === 1) {
						me.showcaseActionButton.setButtonText(
							features.flashcard ? Messages.SHOWCASE_FLASHCARD : Messages.SHOWCASE_MODE
						);
					} else {
						me.showcaseActionButton.setButtonText(
							features.flashcard ? Messages.SHOWCASE_FLASHCARDS : Messages.SHOWCASE_MODE_PLURAL
						);
					}
					me.updateActionButtonElements(!!numQuestions);
				}

				ARSnova.app.questionModel.countLectureQuestionAnswers(sessionStorage.getItem("keyword"), {
					success: function (response) {
						var numAnswers = parseInt(response.responseText);
						var panel = ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel.inClassPanel;
						me.badgeOptions.numAnswers = numAnswers;

						lecturePromise.resolve(numQuestions);
						panel.lectureQuestionButton.setBadge([
							{badgeText: numQuestions, badgeCls: "questionsBadgeIcon"},
							{badgeText: numAnswers, badgeCls: "answersBadgeIcon"}
						]);
					},
					failure: failureCallback
				});
			},
			failure: failureCallback
		});

		if (features.jitt) {
			ARSnova.app.questionModel.countPreparationQuestions(sessionStorage.getItem("keyword"), {
				success: function (response) {
					var numQuestions = parseInt(response.responseText);
					me.badgeOptions.numPrepQuestions = numQuestions;

					if (features.jitt && !features.lecture) {
						if (numQuestions === 1) {
							me.showcaseActionButton.setButtonText(Messages.SHOWCASE_TASK);
						} else {
							me.showcaseActionButton.setButtonText(Messages.SHOWCASE_TASKS);
						}
						me.updateActionButtonElements(!!numQuestions);
					}

					ARSnova.app.questionModel.countPreparationQuestionAnswers(sessionStorage.getItem("keyword"), {
						success: function (response) {
							var numAnswers = parseInt(response.responseText);
							var panel = ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel.inClassPanel;
							me.badgeOptions.numPrepAnswers = numAnswers;

							prepPromise.resolve(numQuestions);
							panel.preparationQuestionButton.setBadge([
								{badgeText: numQuestions, badgeCls: "questionsBadgeIcon"},
								{badgeText: numAnswers, badgeCls: "answersBadgeIcon"}
							]);
						},
						failure: failureCallback
					});
				},
				failure: failureCallback
			});
		} else {
			prepPromise.resolve(0);
		}

		RSVP.all([lecturePromise, prepPromise]).then(function (questions) {
			var numQuestions = questions.reduce(function (a, b) {
				return a + b;
			}, 0);

			me.updateCaption();
			if (numQuestions === 0 || !features.learningProgress) {
				me.inClassButtons.remove(me.courseLearningProgressButton, false);
			} else {
				me.inClassButtons.add(me.courseLearningProgressButton);
			}
		});
	},

	countFeedbackQuestions: function () {
		var me = this;

		ARSnova.app.questionModel.countFeedbackQuestions(sessionStorage.getItem("keyword"), null, {
			success: function (response) {
				var questionCount = Ext.decode(response.responseText);
				ARSnova.app.mainTabPanel.tabPanel.feedbackQuestionsPanel.tab.setBadgeText(questionCount.unread);

				me.badgeOptions.numInterposed = !me.badgeOptions.numInterposed ? questionCount.total :
					me.badgeOptions.numInterposed;
				me.badgeOptions.numUnredInterposed = !me.badgeOptions.numUnredInterposed ? questionCount.unread :
					me.badgeOptions.numUnredInterposed;

				me.updateCaption();
				var feedbackQButton = ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel.inClassPanel.feedbackQuestionButton;
				feedbackQButton.setBadge([{
					badgeText: questionCount.total, badgeCls: "feedbackQuestionsBadgeIcon"
				}, {
					badgeText: questionCount.unread, badgeCls: "unreadFeedbackQuestionsBadgeIcon"
				}]);
			},
			failure: function () {
				console.log('server-side error');
			}
		});
	},

	courseLearningProgress: function () {
		var me = this;
		ARSnova.app.sessionModel.getCourseLearningProgress(sessionStorage.getItem("keyword"), {
			success: function (text, color, progress) {
				me.courseLearningProgressButton.setBadge([{badgeText: text, badgeCls: color + "badgeicon"}]);
			},
			failure: function () {
				me.courseLearningProgressButton.setBadge([{badgeText: ""}]);
				me.inClassButtons.remove(me.courseLearningProgressButton, false);
			}
		});
	},

	applyUIChanges: function (features) {
		this.courseLearningProgressButton.setText(
			features.peerGrading ? Messages.EVALUATION_LONG : Messages.COURSES_LEARNING_PROGRESS
		);

		this.lectureQuestionButton.setText(
			features.flashcard ? Messages.FLASHCARDS : Messages.LECTURE_QUESTIONS_LONG
		);
	}
});
