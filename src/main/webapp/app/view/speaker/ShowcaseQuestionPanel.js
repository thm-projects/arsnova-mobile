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
		questionTitleShort: Messages.LECTURE_QUESTIONS
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
				ARSnova.app.innerScrollPanel = false;
				ARSnova.app.taskManager.stop(sTP.showcaseQuestionPanel.updateClockTask);
				sTP.showcaseQuestionPanel.initializeZoomComponents();

				if (sTP.showcaseQuestionPanel.inclassBackButtonHandle) {
					sTP.animateActiveItem(sTP.inClassPanel, animation);
					sTP.showcaseQuestionPanel.inclassBackButtonHandle = false;
				} else {
					sTP.animateActiveItem(sTP.audienceQuestionPanel, animation);
				}
			},
			statisticsButtonHandler: function (button) {
				var sTP = ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel;
				sTP.questionStatisticChart = Ext.create('ARSnova.view.speaker.QuestionStatisticChart', {
					question: ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel._activeItem._activeItem.questionObj,
					lastPanel: this
				});
				sTP.animateActiveItem(sTP.questionStatisticChart, 'slide');
			}
		});

		this.zoomButton = Ext.create('Ext.Button', {
			ui: 'action',
			hidden: true,
			cls: 'zoomButton',
			docked: 'bottom',
			iconCls: 'icon-text-height',
			handler: this.zoomButtonHandler,
			scope: this
		});

		this.zoomSlider = Ext.create('ARSnova.view.CustomSliderField', {
			label: 'Zoom',
			labelWidth: '15%',
			value: 100,
			minValue: 75,
			maxValue: 150,
			increment: 5,
			suffix: '%',
			setZoomLevel: function (sliderField, slider, newValue) {
				newValue = Array.isArray(newValue) ? newValue[0] : newValue;
				if (!sliderField.actualValue || sliderField.actualValue !== newValue) {
					var sTP = ARSnova.app.mainTabPanel.tabPanel.speakerTabPanel;
					sTP.showcaseQuestionPanel.getActiveItem().setZoomLevel(newValue);
					sliderField.actualValue = newValue;
				}
			}
		});

		this.zoomSlider.setListeners({
			drag: this.zoomSlider.config.setZoomLevel,
			change: this.zoomSlider.config.setZoomLevel
		});

		this.actionSheet = Ext.create('Ext.Sheet', {
			left: 0,
			right: 0,
			bottom: 0,
			modal: false,
			centered: false,
			height: 'auto',
			cls: 'zoomActionSheet',
			items: [this.zoomSlider]
		});

		this.add([this.toolbar, this.zoomButton]);
		this.lastActiveIndex = -1;

		this.on('activate', this.onActivate);
		this.on('activate', this.beforeActivate, this, null, 'before');
		this.on('activeitemchange', this.onItemChange);
		this.onAfter('painted', function () {
			ARSnova.app.innerScrollPanel = this;
			var screenWidth = (window.innerWidth > 0) ? window.innerWidth : screen.width;

			if (this.getActiveItem()) {
				this.getActiveItem().checkPiRoundActivation();

				if (screenWidth > 700) {
					this.getActiveItem().setZoomLevel(ARSnova.app.globalZoomLevel);
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

		if (screenWidth >= 700) {
			ARSnova.app.taskManager.start(this.updateClockTask);
		}
	},

	onItemChange: function (panel, newQuestion, oldQuestion) {
		var screenWidth = (window.innerWidth > 0) ? window.innerWidth : screen.width;

		if (!!oldQuestion && oldQuestion.questionObj && oldQuestion.countdownTimer) {
			oldQuestion.countdownTimer.stop();
		}

		if (newQuestion.questionObj) {
			var title = screenWidth >= 520 ? newQuestion.getQuestionTypeMessage() : '';

			if (panel.zoomButton.isActive) {
				newQuestion.setPadding('0 0 50 0');
			}

			panel.zoomButton.setHidden(screenWidth < 700);
			newQuestion.setZoomLevel(ARSnova.app.globalZoomLevel);
			newQuestion.updateQuestionText();
			this.toolbar.setTitle(Ext.util.Format.htmlEncode(title));
		}
	},

	getAllSkillQuestions: function () {
		var hideIndicator = ARSnova.app.showLoadIndicator(Messages.LOAD_MASK_SEARCH_QUESTIONS);

		this.getController().getQuestions(sessionStorage.getItem("keyword"), {
			success: function (response) {
				var activeIndex = 0;
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
				questionIds.forEach(function (questionId) {
					panel.addQuestion(questionsArr[questionId]);
				});

				if (panel.lastActiveIndex !== -1) {
					activeIndex = panel.lastActiveIndex;
					panel.lastActiveIndex = -1;
				}
				panel.setActiveItem(activeIndex);
				panel.checkFirstQuestion();
				hideIndicator();
			},
			failure: function (response) {
				console.log('error');
				hideIndicator();
			}
		});
	},

	addQuestion: function (question) {
		var questionPanel;
		if (question.questionType === 'freetext') {
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
		this.add(questionPanel);
	},

	initializeZoomComponents: function () {
		this.actionSheet.hide();
		this.getParent().remove(this.actionSheet, false);
		this.zoomButton.setIconCls('icon-text-height');
		this.zoomButton.removeCls('zoomSheetActive');
		this.getActiveItem().setPadding('0 0 20 0');
		this.zoomButton.isActive = false;
	},

	zoomButtonHandler: function () {
		if (this.zoomButton.isActive) {
			this.initializeZoomComponents();
		} else {
			this.getParent().add(this.actionSheet);
			this.zoomButton.setIconCls('icon-close');
			this.zoomButton.addCls('zoomSheetActive');
			this.getActiveItem().setPadding('0 0 50 0');
			this.zoomSlider.setSliderValue(ARSnova.app.globalZoomLevel);
			this.zoomButton.isActive = true;
			this.actionSheet.show();
		}
	},

	saveActiveIndex: function () {
		this.lastActiveIndex = this.getActiveIndex();
	},

	checkFirstQuestion: function () {
		var firstQuestionView = this.items.items[0];

		firstQuestionView.fireEvent('preparestatisticsbutton', this.toolbar.statisticsButton);
	},

	setLectureMode: function () {
		this.setQuestionTitleLong(Messages.LECTURE_QUESTION_LONG);
		this.setQuestionTitleShort(Messages.LECTURE_QUESTIONS);
	},

	setPreparationMode: function () {
		this.setQuestionTitleLong(Messages.PREPARATION_QUESTION_LONG);
		this.setQuestionTitleShort(Messages.PREPARATION_QUESTION_SHORT);
	}
});
