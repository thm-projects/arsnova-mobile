/*
 * This file is part of ARSnova Mobile.
 * Copyright (C) 2011-2012 Christian Thomas Weber
 * Copyright (C) 2012-2021 The ARSnova Team and Contributors
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
		'ARSnova.view.SessionStatusButton',
		'ARSnova.view.speaker.InClassActionButtons'
	],

	config: {
		fullscreen: true,
		title: Messages.FEEDBACK,
		scrollable: {
			direction: 'vertical',
			directionLock: true
		},
		layout: {
			type: 'vbox',
			pack: 'center'
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
		var screenWidth = (window.innerWidth > 0) ? window.innerWidth : screen.width;

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
					cls: 'qrCodeButton',
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
			imageCls: 'icon-question',
			mode: 'lecture',
			controller: 'Questions',
			action: 'adHoc',
			scope: this,
			handler: function () {
				var button = this.createAdHocQuestionButton;

				switch (button.config.mode) {
					case 'preparation':
						button.config.controller = 'PreparationQuestions';
						break;
					case 'flashcard':
						button.config.controller = 'FlashcardQuestions';
						break;
					default:
						button.config.controller = 'Questions';
				}
				this.buttonClicked(button);
			}
		});

		this.showcaseActionButton = Ext.create('ARSnova.view.MatrixButton', {
			text: Messages.SHOWCASE_MODE,
			altText: Messages.SHOWCASE_TASKS,
			cls: 'smallerActionButton',
			buttonConfig: 'icon',
			imageCls: 'icon-presenter',
			handler: this.showcaseHandler,
			hidden: true
		});

		this.roleIconButton = Ext.create('ARSnova.view.MatrixButton', {
			text: Messages.CHANGE_ROLE_BUTTONTEXT,
			cls: 'smallerActionButton',
			buttonConfig: 'icon',
			imageCls: 'icon-users',
			handler: function () {
				ARSnova.app.getController('Sessions').changeRole();
			}
		});

		this.actionButtonPanel = Ext.create('Ext.Panel', {
			layout: {
				type: 'hbox',
				pack: 'center'
			},

			items: [{
				xtype: 'spacer',
				flex: '3',
				width: true
			}, this.showcaseActionButton, {
				xtype: 'spacer',
				itemId: 'innerLeftSpacer'
			}, this.createAdHocQuestionButton, {
				xtype: 'spacer',
				itemId: 'innerRightSpacer'
			}, this.roleIconButton, {
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

		this.flashcardQuestionButton = Ext.create('ARSnova.view.MultiBadgeButton', {
			text: Messages.FLASHCARDS,
			cls: 'forwardListButton',
			controller: 'FlashcardQuestions',
			action: 'listQuestions',
			handler: this.buttonClicked
		});

		this.liveFeedbackButton = Ext.create('ARSnova.view.MultiBadgeButton', {
			text: Messages.LIVE_FEEDBACK,
			cls: 'forwardListButton',
			controller: 'Feedback',
			action: 'showFeedbackStatistic',
			handler: this.buttonClicked
		});

		this.feedbackQuestionButton = Ext.create('ARSnova.view.MultiBadgeButton', {
			ui: 'normal',
			text: screenWidth < 450 ?
				Messages.QUESTIONS_FROM_STUDENTS_SHORT :
				Messages.QUESTIONS_FROM_STUDENTS,
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
			this.preparationQuestionButton,
			this.flashcardQuestionButton,
			this.liveFeedbackButton
		];

		this.inClassActions = Ext.create('ARSnova.view.speaker.InClassActionButtons');

		this.inClassButtons = Ext.create('Ext.form.FormPanel', {
			cls: 'standardForm inClassForm topPadding',
			scrollable: null,
			items: buttons
		});

		this.caption = Ext.create('ARSnova.view.Caption', {
			style: "border-radius: 15px",
			minScreenWidth: 440,
			hidden: true
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
				this.actionButtonPanel,
				this.inClassButtons,
				{
					xtype: 'formpanel',
					cls: 'standardForm inClassForm topPadding',
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
			numFlashcards: 0,
			numUnreadInterposed: 0
		};

		this.add([this.toolbar, this.inClassItems]);
		this.on('destroy', this.destroyListeners);

		this.onBefore('painted', this.onActivate);
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

	showcaseLiveQuestionHandler: function () {
		var tabPanel = ARSnova.app.mainTabPanel.tabPanel;
		tabPanel.animateActiveItem(tabPanel.feedbackTabPanel, 'slide');
	},

	changeActionButtonsMode: function (features) {
		features = features || ARSnova.app.getController('Feature').getActiveFeatures();
		var sTP = ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel;
		this.createAdHocQuestionButton.setImageCls(this.createAdHocQuestionButton.config.imageCls);

		if (features.liveClicker) {
			this.showcaseActionButton.setHandler(this.showcaseLiveQuestionHandler);
			this.showcaseActionButton.setButtonText(Messages.SHOWCASE_LIVE_CLICKER);
		} else if (features.jitt && !features.lecture) {
			sTP.showcaseQuestionPanel.setPreparationMode();
			this.createAdHocQuestionButton.config.mode = 'preparation';
			this.showcaseActionButton.setButtonText(this.showcaseActionButton.config.altText);
			this.createAdHocQuestionButton.setButtonText(this.createAdHocQuestionButton.config.altText);
			this.showcaseActionButton.setHandler(this.showcaseHandler);
		} else if (features.flashcardFeature && !features.lecture) {
			sTP.showcaseQuestionPanel.setFlashcardMode();
			this.createAdHocQuestionButton.config.mode = 'flashcard';
			this.showcaseActionButton.setHandler(this.showcaseHandler);
			this.createAdHocQuestionButton.setButtonText(Messages.NEW_FLASHCARD);
			this.createAdHocQuestionButton.setImageCls('icon-newsession');
		} else {
			sTP.showcaseQuestionPanel.setLectureMode();
			this.createAdHocQuestionButton.config.mode = 'lecture';
			this.showcaseActionButton.setButtonText(this.showcaseActionButton.config.text);
			this.showcaseActionButton.setHandler(this.showcaseHandler);
			this.createAdHocQuestionButton.setButtonText(this.createAdHocQuestionButton.config.text);
		}
		if (features.slides) {
			this.showcaseActionButton.setButtonText(Messages.SHOWCASE_KEYNOTE);
			this.createAdHocQuestionButton.setButtonText(Messages.NEW_CONTENT);
		}
	},

	updateActionButtonElements: function (showElements) {
		var me = this;
		var features = ARSnova.app.getController('Feature').getActiveFeatures();
		var hasQuestionFeature = features.lecture || features.jitt || features.flashcardFeature;

		if (features.liveClicker) {
			showElements = true;
		}

		this.actionButtonPanel.getInnerItems().forEach(function (element) {
			if (element === me.showcaseActionButton || element.getItemId() === 'innerLeftSpacer') {
				element.setHidden(!showElements);
			}
		});

		Ext.ComponentQuery.query('#innerRightSpacer')[0].setHidden(!hasQuestionFeature);
	},

	/* will be called on session login */
	registerListeners: function () {
		var features = ARSnova.app.getController('Feature').getActiveFeatures();
		var inClassPanel = ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel.inClassPanel;
		ARSnova.app.taskManager.start(inClassPanel.countFeedbackQuestionsTask);

		if (features.learningProgress) {
			ARSnova.app.sessionModel.on(ARSnova.app.sessionModel.events.learningProgressChange, this.learningProgressChange, this);
			ARSnova.app.taskManager.start(inClassPanel.courseLearningProgressTask);
		}
	},

	/* will be called whenever panel is shown */
	refreshListeners: function () {
		var features = ARSnova.app.getController('Feature').getActiveFeatures();

		// tasks should get run immediately
		this.countFeedbackQuestionsTask.taskRunTime = 0;
		if (features.learningProgress) {
			this.courseLearningProgressTask.taskRunTime = 0;
		}
	},

	/* will be called on session logout */
	destroyListeners: function () {
		var inClassPanel = ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel.inClassPanel;
		ARSnova.app.taskManager.stop(inClassPanel.countFeedbackQuestionsTask);
		ARSnova.app.sessionModel.un(ARSnova.app.sessionModel.events.learningProgressChange, this.learningProgressChange, this);
		ARSnova.app.taskManager.stop(inClassPanel.courseLearningProgressTask);
	},

	onActivate: function () {
		var features = ARSnova.app.getController('Feature').getActiveFeatures();
		this.changeActionButtonsMode(features);
		var sTP = ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel;
		sTP.inClassPanel.updateActionButtonElements(false);
		sTP.inClassPanel.updateAudienceQuestionBadge();
		this.applyUIChanges(features);
	},

	updateCaption: function () {
		var me = this, hasOptions = false;
		var features = ARSnova.app.getController('Feature').getActiveFeatures();

		if (features) {
			if (!features.lecture) {
				this.badgeOptions.numQuestions = 0;
				this.badgeOptions.numAnswers = 0;
			}

			if (!features.jitt) {
				this.badgeOptions.numPrepQuestions = 0;
				this.badgeOptions.numPrepAnswers = 0;
			}

			if (!features.interposed) {
				this.badgeOptions.numInterposed = 0;
				this.badgeOptions.numUnreadInterposed = 0;
			}

			if (!features.flashcardFeature) {
				this.badgeOptions.numFlashcards = 0;
			}
		}

		hasOptions = this.badgeOptions.numAnswers ||
			this.badgeOptions.numPrepAnswers ||
			this.badgeOptions.numUnreadInterposed ||
			this.badgeOptions.numInterposed ||
			this.badgeOptions.numQuestions ||
			this.badgeOptions.numPrepQuestions ||
			this.badgeOptions.numFlashcards;

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
		var fcPromise = new RSVP.Promise();

		ARSnova.app.questionModel.countLectureQuestions(sessionStorage.getItem("keyword"), {
			success: function (response) {
				var numQuestions = parseInt(response.responseText);
				var singularText, pluralText;

				me.badgeOptions.numQuestions = numQuestions;

				if (features.total || features.slides) {
					singularText = pluralText = Messages.SHOWCASE_KEYNOTE;
				} else {
					singularText = Messages.SHOWCASE_MODE;
					pluralText = Messages.SHOWCASE_MODE_PLURAL;
				}

				if (numQuestions && (features.lecture || features.slides)) {
					if (numQuestions === 1 || features.liveClicker) {
						me.showcaseActionButton.setButtonText(singularText);
					} else {
						me.showcaseActionButton.setButtonText(pluralText);
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

		if (features.flashcardFeature) {
			ARSnova.app.questionModel.countFlashcards(sessionStorage.getItem("keyword"), {
				success: function (response) {
					var numFlashcards = parseInt(response.responseText);
					me.badgeOptions.numFlashcards = numFlashcards;

					if (!features.jitt && !features.lecture && features.flashcardFeature) {
						if (numFlashcards === 1) {
							me.showcaseActionButton.setButtonText(Messages.SHOWCASE_FLASHCARD);
						} else {
							me.showcaseActionButton.setButtonText(Messages.SHOWCASE_FLASHCARDS);
						}
						me.updateActionButtonElements(!!numFlashcards);
					}

					fcPromise.resolve(numFlashcards);
					me.flashcardQuestionButton.setBadge([
						{badgeText: numFlashcards, badgeCls: "flashcardBadgeIcon"}
					]);
				},
				failure: failureCallback
			});
		} else {
			fcPromise.resolve(0);
		}

		RSVP.all([lecturePromise, prepPromise, fcPromise]).then(function (questions) {
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
		var features = ARSnova.app.getController('Feature').getActiveFeatures();

		ARSnova.app.questionModel.countFeedbackQuestions(sessionStorage.getItem("keyword"), null, {
			success: function (response) {
				var questionCount = Ext.decode(response.responseText);
				ARSnova.app.mainTabPanel.tabPanel.feedbackQuestionsPanel.tab.setBadgeText(questionCount.unread);

				if (features.interposed && ARSnova.app.activeSpeakerUtility) {
					var hideOverlay = !parseInt(questionCount.unread);
					ARSnova.app.activeSpeakerUtility.interposedOverlay.setBadgeText(questionCount.unread);
					ARSnova.app.activeSpeakerUtility.hideInterposedOverlay = hideOverlay;
					ARSnova.app.activeSpeakerUtility.checkOverlayVisibility();
				}

				me.badgeOptions.numInterposed = !me.badgeOptions.numInterposed ? questionCount.total :
					me.badgeOptions.numInterposed;
				me.badgeOptions.numUnreadInterposed = !me.badgeOptions.numUnreadInterposed ? questionCount.unread :
					me.badgeOptions.numUnreadInterposed;

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
		var lectureButtonText = Messages.LECTURE_QUESTIONS_LONG;
		var adHocIconEl = this.createAdHocQuestionButton.element.down('.iconBtnImg');
		var tabPanel = ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel;

		this.courseLearningProgressButton.setText(
			features.peerGrading ? Messages.EVALUATION_ALT : Messages.COURSES_LEARNING_PROGRESS
		);

		if (features.total || features.slides || features.flashcard) {
			adHocIconEl.replaceCls('icon-question', 'icon-pencil');
		} else {
			adHocIconEl.replaceCls('icon-pencil', 'icon-question');
		}

		if (features.jitt && !features.lecture) {
			tabPanel.showcaseQuestionPanel.setPreparationMode();
			tabPanel.newQuestionPanel.setVariant('preparation');
		} else if (features.flashcardFeature && !features.lecture) {
			tabPanel.showcaseQuestionPanel.setFlashcardMode();
			tabPanel.newQuestionPanel.setVariant('flashcard');
		} else {
			tabPanel.showcaseQuestionPanel.setLectureMode();
			tabPanel.newQuestionPanel.setVariant('lecture');
		}

		var badgeTranslation = Ext.clone(this.caption.config.badgeTranslation);
		if (features.total || features.slides) {
			lectureButtonText = Messages.SLIDE_LONG;
			Ext.apply(badgeTranslation, {
				questions: Messages.CONTENT_PLURAL
			});
		}
		this.caption.setBadgeTranslation(badgeTranslation);

		if (features.peerGrading) {
			lectureButtonText = Messages.EVALUATION_QUESTIONS;
		}

		this.updateCaption();
		this.lectureQuestionButton.setText(lectureButtonText);
	}
});
