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
Ext.define('ARSnova.view.speaker.ShowcaseQuestionPanel', {
	extend: 'Ext.Carousel',

	requires: [
		'Ext.Sheet',
		'Ext.ActionSheet',
		'ARSnova.view.Question',
		'ARSnova.view.CustomCarousel',
		'ARSnova.view.CustomCarouselIndicator',
		'ARSnova.view.ImageAnswerPanel',
		'ARSnova.view.FreetextAnswerPanel',
		'ARSnova.view.speaker.QuestionStatisticChart',
		'ARSnova.view.components.QuestionToolbar'
	],

	config: {
		fullscreen: true,
		title: Messages.QUESTIONS,

		controller: null,
		questionTitleLong: Messages.LECTURE_QUESTION_LONG,
		questionTitleShort: Messages.LECTURE_QUESTIONS,
		mode: 'lecture'
	},

	updateClockTask: {
		name: 'renew the actual time at the titlebar',
		run: function () {
			ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel.showcaseQuestionPanel.toolbar.updateTime();
		},
		interval: 1000 // 1 second
	},

	initialize: function () {
		this.callParent(arguments);

		var me = this;
		this.on('activeitemchange', function (panel, newCard, oldCard) {
			if (newCard.questionObj.questionType !== 'flashcard') {
				this.toolbar.statisticsButton.show();
			} else {
				this.toolbar.statisticsButton.hide();
			}

			newCard.fireEvent('preparestatisticsbutton', this.toolbar.statisticsButton);
		}, this);

		this.toolbar = Ext.create('ARSnova.view.components.QuestionToolbar', {
			cls: 'speakerTitleText',
			showcase: true,
			backButtonHandler: function (animation) {
				var sTP = ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel;
				var panel = sTP.showcaseQuestionPanel;

				ARSnova.app.innerScrollPanel = false;
				ARSnova.app.taskManager.stop(panel.updateClockTask);
				sTP.showcaseQuestionPanel.speakerUtilities.initializeZoomComponents();

				if (ARSnova.app.projectorModeActive) {
					panel.speakerUtilities.restoreZoomLevel();
					panel.setProjectorMode(panel, false);
				}

				if (panel.inclassBackButtonHandle) {
					sTP.animateActiveItem(sTP.inClassPanel, animation);
					panel.inclassBackButtonHandle = false;
				} else {
					sTP.animateActiveItem(sTP.audienceQuestionPanel, animation);
				}
			},
			statisticsButtonHandler: function (button) {
				var sTP = ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel;
				var question = sTP._activeItem._activeItem;
				ARSnova.app.getController('Statistics').prepareStatistics(question);
			}
		});

		this.speakerUtilities = Ext.create('ARSnova.view.speaker.SpeakerUtilities', {
			parentReference: this,
			panelConfiguration: 'carousel',
			showProjectorButton: true,
			showHideControlButton: true,
			projectorHandler: this.setProjectorMode,
			hideControlHandler: this.setControlsHidden,
			hidden: true
		});

		this.add([this.toolbar, this.speakerUtilities]);
		this.lastActiveIndex = -1;

		this.on('painted', this.onPainted);
		this.on('activate', this.onActivate);
		this.on('activate', this.beforeActivate, this, null, 'before');
		this.on('activeitemchange', this.onItemChange);
		this.onAfter('painted', function () {
			ARSnova.app.innerScrollPanel = this;
			var screenWidth = (window.innerWidth > 0) ? window.innerWidth : screen.width;

			if (this.getActiveItem() && this.getActiveItem().questionObj) {
				this.getActiveItem().checkPiRoundActivation();

				if (screenWidth >= 700) {
					this.speakerUtilities.show();
					this.setProjectorMode(this, ARSnova.app.projectorModeActive);
				} else {
					this.speakerUtilities.hide();
				}
			}
		});
	},

	beforeActivate: function () {
		this.removeAll();
		this._indicator.show();
		this.toolbar.setTitle("");
	},

	onActivate: function () {
		var screenWidth = (window.innerWidth > 0) ? window.innerWidth : screen.width;
		this.getAllSkillQuestions();
		this.stamps = [];

		if (screenWidth >= 700) {
			ARSnova.app.taskManager.start(this.updateClockTask);
			this.speakerUtilities.initializeZoomComponents();

			if (ARSnova.app.projectorModeActive) {
				ARSnova.app.getController('Application').setGlobalZoomLevel(130);
			}
		}
	},

	onPainted: function () {
		this.updateEditButtons();
		if (this.getActiveItem()) {
			this.getActiveItem().setAnswerCount();
		}
	},

	onItemChange: function (panel, newQuestion, oldQuestion) {
		var screenWidth = (window.innerWidth > 0) ? window.innerWidth : screen.width;
		var questionObj = newQuestion.questionObj;

		if (oldQuestion && oldQuestion.questionObj && oldQuestion.countdownTimer) {
			oldQuestion.countdownTimer.stop();
		}

		if (questionObj) {
			var title = screenWidth >= 520 ? newQuestion.getQuestionTypeMessage() : '';
			var isFlashcard = questionObj.questionType === 'flashcard';

			if (panel.speakerUtilities.isZoomElementActive() && !isFlashcard) {
				newQuestion.setPadding('0 0 50 0');
			}

			if (questionObj.questionType !== 'slide') {
				panel.speakerUtilities.commentOverlay.setHidden(true);
			}

			panel.getActiveItem().setAnswerCount();
			panel.updateControlButtonHiddenState();
			panel.toolbar.checkFlashcard(newQuestion);
			panel.speakerUtilities.setHidden(screenWidth < 700);
			panel.speakerUtilities.checkQuestionType(newQuestion);
			panel.toolbar.checkStatisticButtonIcon(questionObj);
			panel.speakerUtilities.hideShowcaseControlButton.setHidden(isFlashcard);
			panel.setProjectorMode(this, ARSnova.app.projectorModeActive && screenWidth > 700, true);
			panel.toolbar.setTitle(Ext.util.Format.htmlEncode(title));
			newQuestion.setZoomLevel(ARSnova.app.globalZoomLevel);
			newQuestion.updateQuestionText();
		}
	},

	setZoomLevel: function () {
		var activeItem = this.getActiveItem();

		if (activeItem.questionObj) {
			activeItem.setZoomLevel(ARSnova.app.globalZoomLevel);
		}
	},

	setProjectorMode: function (scope, enable, noFullscreen) {
		var sTP = ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel;
		var showcasePanel = sTP.showcaseQuestionPanel;
		var activePanel = showcasePanel.getActiveItem();
		var hasActiveItem = !!activePanel.questionObj;
		var activate = enable && hasActiveItem;

		if (activate) {
			sTP.showcaseQuestionPanel.addCls('projector-mode');
		} else {
			sTP.showcaseQuestionPanel.removeCls('projector-mode');
		}

		sTP.showcaseQuestionPanel.speakerUtilities.setProjectorMode(showcasePanel, activate, noFullscreen);

		if (hasActiveItem && activePanel.questionObj.questionType === 'flashcard') {
			setTimeout(function () { activePanel.resizeFlashcardContainer(); }, 750);
		}
	},

	updateControlButtonHiddenState: function (panel) {
		var sTP = ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel;
		var showcasePanel = sTP.showcaseQuestionPanel;
		var questionPanel = panel || showcasePanel.getActiveItem();
		var controls = questionPanel.editButtons;

		if (controls) {
			showcasePanel.setControlsHidden(!showcasePanel.speakerUtilities.isShowcaseEditPanelActive(), panel);
		}
	},

	setControlsHidden: function (hide, panel) {
		var sTP = ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel;
		var showcasePanel = sTP.showcaseQuestionPanel;
		var questionPanel = panel && panel.questionObj ? panel : showcasePanel.getActiveItem();
		var controls = questionPanel.editButtons;
		hide = typeof hide !== 'boolean' ? !controls.isHidden() : hide;

		if (controls) {
			controls.setHidden(hide);
			showcasePanel.speakerUtilities.updateShowcaseControlButton(controls.isHidden());
		}
	},

	updateAllQuestionPanels: function () {
		var me = this;
		var items = this.getInnerItems();

		items.forEach(function (panel) {
			me.updateControlButtonHiddenState(panel);
			panel.setZoomLevel(ARSnova.app.globalZoomLevel);
		});
	},

	getAllSkillQuestions: function () {
		var hideIndicator = ARSnova.app.showLoadIndicator(Messages.LOAD_MASK_SEARCH_QUESTIONS);

		ARSnova.app.activePiQuestion = false;
		this.getController().getQuestions(sessionStorage.getItem("keyword"), {
			success: function (response) {
				var questions = Ext.decode(response.responseText);
				var panel = ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel.showcaseQuestionPanel;

				if (questions.length === 1) {
					panel._indicator.hide();
				}

				var questionsArr = [];
				var questionIds = [];
				questions.forEach(function (question) {
					questionsArr[question._id] = question;
					questionIds.push(question._id);
				});

				panel.addQuestions(questionsArr, questionIds, hideIndicator);
			},
			failure: function (response) {
				console.log('error');
				hideIndicator();
			}
		});
	},

	addQuestion: function (question) {
		var questionPanel;

		if (question.questionType === 'freetext' || question.questionType === 'slide') {
			questionPanel = Ext.create('ARSnova.view.FreetextQuestion', {
				itemId: question._id,
				questionObj: question,
				viewOnly: true
			});
		} else {
			questionPanel = Ext.create('ARSnova.view.Question', {
				itemId: question._id,
				questionObj: question,
				viewOnly: true
			});
		}

		if (questionPanel.editButtons) {
			questionPanel.editButtons.changeVoteManagementButtonState();
		}

		this.add(questionPanel);
	},

	addQuestions: function (questions, questionIds, hideIndicatorFn) {
		var me = this;
		var index = 0;

		var addQuestionTask = function () {
			var questionId = questionIds[index];
			me.addQuestion(questions[questionId]);
			me.setActiveItem(0);

			if (index === questionIds.length - 1) {
				var activeIndex = 0;

				if (me.lastActiveIndex !== -1) {
					activeIndex = me.lastActiveIndex;
					me.lastActiveIndex = -1;
				}

				if (questions[questionId].piRoundActive) {
					ARSnova.app.activePiQuestion = questionId;
				}

				me.setActiveItem(activeIndex);
				me.updateAllQuestionPanels();
				me.checkFirstQuestion();
				hideIndicatorFn();
			} else {
				index++;
				Ext.create('Ext.util.DelayedTask', function () {
					addQuestionTask();
				}).delay(10);
			}
		};

		addQuestionTask();
	},

	updateEditButtons: function () {
		this.getInnerItems().forEach(function (questionPanel) {
			if (questionPanel.editButtons) {
				questionPanel.editButtons.changeVoteManagementButtonState();
			}
		});
	},

	saveActiveIndex: function () {
		this.lastActiveIndex = this.getActiveIndex();
	},

	checkFirstQuestion: function () {
		var firstQuestionView = this.items.items[0];
		firstQuestionView.fireEvent('preparestatisticsbutton', this.toolbar.statisticsButton);
	},

	setLectureMode: function () {
		this.setController(ARSnova.app.getController('Questions'));
		this.setQuestionTitleLong(Messages.LECTURE_QUESTION_LONG);
		this.setQuestionTitleShort(Messages.LECTURE_QUESTIONS);
		this.setMode('lecture');
	},

	setPreparationMode: function () {
		this.setController(ARSnova.app.getController('PreparationQuestions'));
		this.setQuestionTitleLong(Messages.PREPARATION_QUESTION_LONG);
		this.setQuestionTitleShort(Messages.PREPARATION_QUESTION_SHORT);
		this.setMode('preparation');
	},

	setFlashcardMode: function () {
		this.setController(ARSnova.app.getController('FlashcardQuestions'));
		this.setQuestionTitleLong(Messages.FLASHCARD);
		this.setQuestionTitleShort(Messages.FLASHCARD_SHORT);
		this.setMode('flashcard');
	}
});
